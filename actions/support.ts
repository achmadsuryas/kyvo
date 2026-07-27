'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupportTicket, SupportMessage } from '@/types';

/**
 * Get active support ticket for current logged in user.
 * Creates one if none exists.
 */
export async function getUserActiveTicket(): Promise<{ success: boolean; ticket?: SupportTicket; message?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Check for existing active ticket
    const { data: existingTicket, error: fetchErr } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress'])
      .order('updated_at', { ascending: false })
      .maybeSingle();

    if (existingTicket) {
      return { success: true, ticket: existingTicket as SupportTicket };
    }

    // Create new ticket
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
 * Send a message in a support ticket
 */
export async function sendSupportMessage(ticketId: string, messageText: string): Promise<{ success: boolean; message?: SupportMessage; error?: string }> {
  if (!messageText.trim()) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in.' };
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const senderRole = profile?.role === 'admin' ? 'admin' : 'user';

    const { data: newMessage, error: insertErr } = await (supabase.from('support_messages') as any)
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: senderRole,
        message: messageText.trim(),
      })
      .select('*, sender:profiles!support_messages_sender_id_fkey(*)')
      .single();

    if (insertErr) {
      // Try fallback insert if join selection had issues
      const { data: fallbackMsg, error: fbErr } = await (supabase.from('support_messages') as any)
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          sender_role: senderRole,
          message: messageText.trim(),
        })
        .select()
        .single();

      if (fbErr || !fallbackMsg) {
        return { success: false, error: fbErr?.message || insertErr.message };
      }

      // Touch ticket updated_at timestamp
      await (supabase.from('support_tickets') as any)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return { success: true, message: fallbackMsg as SupportMessage };
    }

    // Touch ticket updated_at
    await (supabase.from('support_tickets') as any)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return { success: true, message: newMessage as SupportMessage };
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

    if (newStatus === 'resolved') {
      // Delete ticket and cascade messages to keep DB lightweight
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        return { success: false, message: error.message };
      }

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

      revalidatePath('/dashboard/admin');
      return { success: true, message: `Ticket status updated to ${newStatus === 'in_progress' ? 'Proses' : 'Open'}!` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update ticket status.';
    return { success: false, message: msg };
  }
}
