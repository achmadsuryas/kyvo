'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupportTicket, SupportMessage } from '@/types';
import { sendDiscordTicketWebhook, sendDiscordAuditWebhook } from '@/lib/discord/webhook';

/**
 * Get active support ticket for current logged in user.
 * Only creates a ticket if autoCreate is explicitly true (defaults to false).
 */
export async function getUserActiveTicket(autoCreate = false): Promise<{ success: boolean; ticket?: SupportTicket; message?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Check for existing active ticket
    const { data: existingTicket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress'])
      .order('updated_at', { ascending: false })
      .maybeSingle();

    if (existingTicket) {
      return { success: true, ticket: existingTicket as SupportTicket };
    }

    if (!autoCreate) {
      return { success: true, ticket: undefined };
    }

    // Create new ticket on demand
    const { data: newTicket, error: createErr } = await (supabase.from('support_tickets') as any)
      .insert({
        user_id: user.id,
        status: 'open',
      })
      .select()
      .single();

    if (createErr || !newTicket) {
      return { success: false, message: createErr?.message || 'Failed to create support ticket.' };
    }

    return { success: true, ticket: newTicket as SupportTicket };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch support ticket.';
    return { success: false, message: msg };
  }
}

/**
 * Get messages for a support ticket
 */
export async function getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
  try {
    const supabase = await createClient();
    const { data: messages, error } = await supabase
      .from('support_messages')
      .select('*, sender:profiles!support_messages_sender_id_fkey(*)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      // Fallback query without explicit fkey alias if alias differs
      const { data: fallback } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      return (fallback as SupportMessage[]) || [];
    }

    return (messages as SupportMessage[]) || [];
  } catch (err) {
    console.error('Error fetching ticket messages:', err);
    return [];
  }
}

/**
 * Send a message in a support ticket.
 * Automatically creates ticket if ticketId is null, and appends an automated bot reply on 1st message.
 */
export async function sendSupportMessage(
  ticketIdInput: string | null,
  messageText: string
): Promise<{ success: boolean; message?: SupportMessage; ticket?: SupportTicket; error?: string }> {
  if (!messageText.trim()) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in.' };
    }

    let targetTicketId = ticketIdInput;
    let targetTicket: SupportTicket | undefined;

    // If no ticket ID provided, find or create active ticket
    if (!targetTicketId) {
      const res = await getUserActiveTicket(true);
      if (!res.success || !res.ticket) {
        return { success: false, error: res.message || 'Failed to initialize support ticket.' };
      }
      targetTicketId = res.ticket.id;
      targetTicket = res.ticket;
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const senderRole = profile?.role === 'admin' ? 'admin' : 'user';

    // Count current messages before inserting to check if this is the first user message
    const { count } = await supabase
      .from('support_messages')
      .select('*', { count: 'exact', head: true })
      .eq('ticket_id', targetTicketId);

    const isFirstMessage = (count || 0) === 0;

    const { data: newMessage, error: insertErr } = await (supabase.from('support_messages') as any)
      .insert({
        ticket_id: targetTicketId,
        sender_id: user.id,
        sender_role: senderRole,
        message: messageText.trim(),
      })
      .select('*, sender:profiles!support_messages_sender_id_fkey(*)')
      .single();

    if (insertErr || !newMessage) {
      return { success: false, error: insertErr?.message || 'Failed to send message.' };
    }

    // If this is the user's first message, insert an automated bot initial response
    if (isFirstMessage && senderRole === 'user') {
      const autoReplyText =
        'Hello! 👋 Thank you for reaching out to Kyvo Support. This is an automated message. Our support team has been notified and will assist you shortly. Please wait a moment!';

      await (supabase.from('support_messages') as any).insert({
        ticket_id: targetTicketId,
        sender_id: user.id,
        sender_role: 'admin',
        message: autoReplyText,
      });
    }

    // Touch ticket updated_at
    await (supabase.from('support_tickets') as any)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetTicketId);

    // Trigger Discord Webhook Notification for Admin Ticket Channel
    const senderName = (newMessage as any)?.sender?.display_name || (newMessage as any)?.sender?.username || user.email?.split('@')[0] || 'Kyvo User';
    const webhookRes = await sendDiscordTicketWebhook({
      ticketId: targetTicketId!,
      username: senderName,
      email: user.email,
      subject: isFirstMessage ? 'New Support Ticket Request' : `Support Message (${senderRole.toUpperCase()})`,
      message: messageText.trim(),
      status: targetTicket?.status || 'open',
      isReply: !isFirstMessage,
      threadId: (targetTicket as any)?.discord_thread_id || null,
    }).catch((err) => {
      console.error('Discord Ticket Webhook error:', err);
      return null;
    });

    if (webhookRes?.threadId && targetTicketId) {
      await (supabase.from('support_tickets') as any)
        .update({ discord_thread_id: webhookRes.threadId })
        .eq('id', targetTicketId);
    }

    return { success: true, message: newMessage as SupportMessage, ticket: targetTicket };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send message.';
    return { success: false, error: msg };
  }
}

/**
 * Fetch all support tickets for Admin panel
 */
export async function getAllTicketsForAdmin(): Promise<SupportTicket[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') return [];

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*, user:profiles!support_tickets_user_id_fkey(*)')
      .order('updated_at', { ascending: false });

    if (error) {
      const { data: fallback } = await supabase
        .from('support_tickets')
        .select('*')
        .order('updated_at', { ascending: false });
      return (fallback as SupportTicket[]) || [];
    }

    return (tickets as SupportTicket[]) || [];
  } catch (err) {
    console.error('Error fetching admin support tickets:', err);
    return [];
  }
}

/**
 * Update support ticket status.
 * If status === 'resolved', deletes the ticket from DB (auto cleans messages) to stay lightweight.
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: 'open' | 'in_progress' | 'resolved'
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Fetch ticket and user info for Discord notification before updating/deleting
    const { data: targetTicket } = await supabase
      .from('support_tickets')
      .select('*, user:profiles!support_tickets_user_id_fkey(*)')
      .eq('id', ticketId)
      .maybeSingle();

    const targetUser = (targetTicket as any)?.user?.username || (targetTicket as any)?.user?.display_name || 'Kyvo User';
    
    // Fetch admin username
    const { data: adminProf } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();
    const adminUser = (adminProf as any)?.username || user.email?.split('@')[0] || 'System Admin';

    if (newStatus === 'resolved') {
      // Delete ticket and cascade messages to keep DB lightweight
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        return { success: false, message: error.message };
      }

      // Send Audit Log notification to #admin-audit-log channel that ticket is resolved
      await sendDiscordAuditWebhook({
        actionType: 'TICKET_RESOLVED',
        targetUsername: targetUser,
        adminUsername: adminUser,
        reason: `Support Ticket #${ticketId.substring(0, 8)} has been marked as RESOLVED & CLOSED! ✅`,
      }).catch((err) => console.error('Discord Audit Webhook Error:', err));

      revalidatePath('/dashboard/admin');
      return { success: true, message: 'Ticket resolved and cleaned from database!' };
    } else {
      const { error } = await (supabase.from('support_tickets') as any)
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) {
        return { success: false, message: error.message };
      }

      if (newStatus === 'in_progress') {
        // Send notification to #support-tickets channel that ticket is IN PROGRESS
        await sendDiscordTicketWebhook({
          ticketId,
          username: targetUser,
          subject: 'Ticket Status Change: IN PROGRESS ⏳',
          message: `Admin @${adminUser} has marked Ticket #${ticketId.substring(0, 8)} as IN PROGRESS. Active support in progress.`,
          status: 'in_progress',
          isReply: true,
        }).catch((err) => console.error('Discord Ticket Webhook Error:', err));
      }

      revalidatePath('/dashboard/admin');
      return { success: true, message: `Ticket status updated to ${newStatus === 'in_progress' ? 'In Progress' : 'Open'}!` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update ticket status.';
    return { success: false, message: msg };
  }
}
