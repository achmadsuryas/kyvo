import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { 
  sendDiscordTicketWebhook, 
  sendDiscordSignupWebhook, 
  sendDiscordAuditWebhook, 
  sendDiscordMilestoneWebhook 
} from '@/lib/discord/webhook';
import { updateTicketStatus } from '@/actions/support';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://csblgetxpymfmubyhijy.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createAdminClient(supabaseUrl, anonKey);
}

/**
 * Verify Discord HTTP Interaction Ed25519 Signatures
 */
async function verifyDiscordSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKeyHex: string
): Promise<boolean> {
  if (!signature || !timestamp || !publicKeyHex) return false;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(timestamp + rawBody);

    const hexToBytes = (hex: string) =>
      new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

    const keyBytes = hexToBytes(publicKeyHex);
    const sigBytes = hexToBytes(signature);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify']
    );

    return await crypto.subtle.verify('Ed25519', cryptoKey, sigBytes, data);
  } catch (err) {
    console.error('Discord signature verification error:', err);
    return false;
  }
}

/**
 * Discord Bot Interaction Endpoint & Test Route
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature-Ed25519');
    const timestamp = req.headers.get('X-Signature-Timestamp');
    const publicKey = process.env.DISCORD_PUBLIC_KEY;

    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }

    // 1. Handle Discord PING Interaction (Type 1) for Developer Portal Endpoint Validation
    if (body.type === 1) {
      if (publicKey && signature && timestamp) {
        const isValid = await verifyDiscordSignature(rawBody, signature, timestamp, publicKey);
        if (!isValid) {
          return new Response('Invalid request signature', { status: 401 });
        }
      }
      return NextResponse.json({ type: 1 });
    }

    // Verify signature for Slash Commands
    if (publicKey && signature && timestamp) {
      const isValid = await verifyDiscordSignature(rawBody, signature, timestamp, publicKey);
      if (!isValid) {
        return new Response('Invalid request signature', { status: 401 });
      }
    }

    // 2. Handle Manual Test Request from Admin / Dev
    if (body.type === 'test') {
      const channel = body.channel || 'tickets';
      let result;

      switch (channel) {
        case 'tickets':
          result = await sendDiscordTicketWebhook({
            ticketId: 'test-12345678',
            username: 'test_creator',
            email: 'creator@kyvo.fun',
            subject: 'Kyvo Discord Webhook Integration Test',
            message: '🎉 Hello Admin! Kyvo Support Webhook has been connected successfully to this Discord channel!',
            status: 'OPEN',
            isReply: false,
          });
          break;
        case 'audit':
          result = await sendDiscordAuditWebhook({
            actionType: 'BADGE_GRANT',
            targetUsername: 'test_creator',
            adminUsername: 'kyvo_admin',
            badgeName: 'Verified Creator',
            reason: 'Kyvo Discord Audit Webhook Integration Test',
          });
          break;
        case 'signups':
          result = await sendDiscordSignupWebhook({
            username: 'new_creator',
            displayName: 'New Kyvo Creator',
            email: 'new@kyvo.fun',
          });
          break;
        case 'milestones':
          result = await sendDiscordMilestoneWebhook({
            username: 'popular_creator',
            displayName: 'Popular Creator',
            viewsCount: 1000,
          });
          break;
        default:
          return NextResponse.json({ error: 'Unknown test channel' }, { status: 400 });
      }

      return NextResponse.json({ success: true, channel, result });
    }

    // 3. Handle Discord Slash Commands & Interactive Replies (Type 2)
    if (body.type === 2) {
      const commandName = body.data?.name;
      const options = body.data?.options || [];
      const channelId = body.channel_id;

      const supabase = getSupabaseAdmin();

      // SLASH COMMAND: /reply [message]
      if (commandName === 'reply') {
        const replyText = options.find((opt: any) => opt.name === 'message')?.value;

        if (!replyText || !replyText.trim()) {
          return NextResponse.json({
            type: 4,
            data: { content: '❌ Reply message cannot be empty.' },
          });
        }

        // Find active ticket by discord_thread_id OR active open ticket
        let targetTicketId: string | null = null;
        let targetUserId: string | null = null;

        if (channelId) {
          const { data: ticketByThread } = await supabase
            .from('support_tickets')
            .select('id, user_id')
            .eq('discord_thread_id', channelId)
            .maybeSingle();

          if (ticketByThread) {
            targetTicketId = ticketByThread.id;
            targetUserId = ticketByThread.user_id;
          }
        }

        // Fallback: find latest active ticket in_progress or open
        if (!targetTicketId) {
          const { data: latestActive } = await supabase
            .from('support_tickets')
            .select('id, user_id')
            .in('status', ['open', 'in_progress'])
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestActive) {
            targetTicketId = latestActive.id;
            targetUserId = latestActive.user_id;
          }
        }

        if (!targetTicketId || !targetUserId) {
          return NextResponse.json({
            type: 4,
            data: { content: '❌ Could not find an active support ticket matching this thread/channel.' },
          });
        }

        // Insert message into support_messages table so user sees it live on website!
        const { error: insertErr } = await (supabase.from('support_messages') as any).insert({
          ticket_id: targetTicketId,
          sender_id: targetUserId,
          sender_role: 'admin',
          message: replyText.trim(),
        });

        if (insertErr) {
          return NextResponse.json({
            type: 4,
            data: { content: `❌ Error sending reply: ${insertErr.message}` },
          });
        }

        // Touch ticket updated_at
        await (supabase.from('support_tickets') as any)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', targetTicketId);

        return NextResponse.json({
          type: 4,
          data: {
            content: `💬 **Admin Reply Synced to Web Live!**\n> ${replyText.trim()}`,
          },
        });
      }

      // SLASH COMMAND: /status [status]
      if (commandName === 'status') {
        const newStatus = options.find((opt: any) => opt.name === 'status')?.value;

        if (!newStatus) {
          return NextResponse.json({
            type: 4,
            data: { content: '❌ Please select a status: `in_progress`, `resolved`, or `open`.' },
          });
        }

        let targetTicketId: string | null = null;

        if (channelId) {
          const { data: ticketByThread } = await supabase
            .from('support_tickets')
            .select('id')
            .eq('discord_thread_id', channelId)
            .maybeSingle();

          if (ticketByThread) {
            targetTicketId = ticketByThread.id;
          }
        }

        if (!targetTicketId) {
          const { data: latestActive } = await supabase
            .from('support_tickets')
            .select('id')
            .in('status', ['open', 'in_progress'])
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestActive) {
            targetTicketId = latestActive.id;
          }
        }

        if (!targetTicketId) {
          return NextResponse.json({
            type: 4,
            data: { content: '❌ No active support ticket found for this channel.' },
          });
        }

        const res = await updateTicketStatus(targetTicketId, newStatus as any);

        return NextResponse.json({
          type: 4,
          data: {
            content: res.success 
              ? `⚙️ **Ticket Status Updated**: Ticket status set to **${newStatus.toUpperCase()}**!` 
              : `❌ ${res.message}`,
          },
        });
      }

      // SLASH COMMAND: /check-user [username]
      if (commandName === 'check-user') {
        const username = options.find((opt: any) => opt.name === 'username')?.value;

        if (!username) {
          return NextResponse.json({
            type: 4,
            data: { content: '❌ Please provide a username.' },
          });
        }

        const clean = username.trim().toLowerCase().replace(/^@/, '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', clean)
          .maybeSingle();

        if (!profile) {
          return NextResponse.json({
            type: 4,
            data: { content: `❌ User **@${clean}** not found on Kyvo.` },
          });
        }

        return NextResponse.json({
          type: 4,
          data: {
            embeds: [
              {
                title: `👤 User Profile: @${profile.username}`,
                url: `https://kyvo.fun/${profile.username}`,
                color: 0x3B82F6,
                fields: [
                  { name: 'Display Name', value: profile.display_name || profile.username, inline: true },
                  { name: 'Role', value: (profile.role || 'user').toUpperCase(), inline: true },
                  { name: 'Status', value: (profile.status || 'active').toUpperCase(), inline: true },
                  { name: 'Total Views', value: `${(profile.views_count || 0).toLocaleString()} views`, inline: true },
                  { name: 'Profile URL', value: `https://kyvo.fun/${profile.username}`, inline: false },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          },
        });
      }

      // SLASH COMMAND: /tickets
      if (commandName === 'tickets') {
        const { data: activeTickets } = await supabase
          .from('support_tickets')
          .select('*, user:profiles!support_tickets_user_id_fkey(*)')
          .in('status', ['open', 'in_progress'])
          .order('updated_at', { ascending: false });

        if (!activeTickets || activeTickets.length === 0) {
          return NextResponse.json({
            type: 4,
            data: { content: '🎉 No active open support tickets at the moment!' },
          });
        }

        const ticketList = activeTickets
          .map(
            (t: any, idx: number) =>
              `${idx + 1}. **Ticket #${t.id.substring(0, 8)}** — @${t.user?.username || 'user'} [Status: \`${t.status.toUpperCase()}\`]`
          )
          .join('\n');

        return NextResponse.json({
          type: 4,
          data: {
            embeds: [
              {
                title: `🎫 Active Support Tickets (${activeTickets.length})`,
                description: ticketList,
                color: 0xFFD43B,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        });
      }

      // SLASH COMMAND: /stats
      if (commandName === 'stats') {
        return NextResponse.json({
          type: 4,
          data: {
            content: '⚡ **Kyvo Platform Stats**: All systems operational! Visit [kyvo.fun](https://kyvo.fun) for live analytics.',
          },
        });
      }

      return NextResponse.json({
        type: 4,
        data: {
          content: `🤖 Kyvo Bot received command: \`/${commandName}\``,
        },
      });
    }

    return NextResponse.json({ status: 'ok', message: 'Kyvo Discord API Endpoint active' });
  } catch (error) {
    console.error('Discord API Route Error:', error);
    return NextResponse.json({ error: 'Failed to process Discord request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    platform: 'Kyvo Discord Webhook Service',
    webhooks: {
      ticketsConfigured: Boolean(process.env.DISCORD_TICKETS_WEBHOOK_URL),
      auditConfigured: Boolean(process.env.DISCORD_AUDIT_WEBHOOK_URL),
      signupsConfigured: Boolean(process.env.DISCORD_SIGNUPS_WEBHOOK_URL),
      milestonesConfigured: Boolean(process.env.DISCORD_MILESTONES_WEBHOOK_URL),
    },
  });
}
