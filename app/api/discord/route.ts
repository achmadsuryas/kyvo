import { NextResponse } from 'next/server';
import { 
  sendDiscordTicketWebhook, 
  sendDiscordSignupWebhook, 
  sendDiscordAuditWebhook, 
  sendDiscordMilestoneWebhook 
} from '@/lib/discord/webhook';

export const dynamic = 'force-dynamic';

/**
 * Discord Bot Interaction Endpoint & Test Route
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Handle Discord PING Interaction (Type 1)
    if (body.type === 1) {
      return NextResponse.json({ type: 1 });
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

    // 3. Handle Discord Slash Commands (Type 2)
    if (body.type === 2) {
      const commandName = body.data?.name;

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
