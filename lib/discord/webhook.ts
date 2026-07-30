/**
 * Discord Webhook Notification Service for Kyvo Platform
 * Sends rich Neobrutalist Discord Embeds to configured Discord channel webhooks.
 */

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

const BRAND_COLORS = {
  yellow: 0xFFD43B, // #FFD43B
  blue: 0x3B82F6,   // #3B82F6
  pink: 0xFF4D6D,   // #FF4D6D
  green: 0x51CF66,  // #51CF66
  purple: 0xA855F7, // #A855F7
  dark: 0x111111,   // #111111
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kyvo.fun';

async function executeWebhook(webhookUrlKey: string, payload: DiscordWebhookPayload) {
  const url = process.env[webhookUrlKey];
  if (!url || !url.startsWith('https://discord.com/api/webhooks/')) {
    console.warn(`[Discord Webhook] Skipped: ${webhookUrlKey} is not configured.`);
    return { success: false, reason: 'Not configured' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username || 'Kyvo Bot',
        avatar_url: payload.avatar_url || `${SITE_URL}/icon.png`,
        ...payload,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Discord Webhook Error] Status ${res.status}:`, text);
      return { success: false, reason: text };
    }

    return { success: true };
  } catch (error) {
    console.error('[Discord Webhook Exception]:', error);
    return { success: false, error };
  }
}

/**
 * 1. Support Ticket Notification (New Ticket / Ticket Reply)
 */
export async function sendDiscordTicketWebhook(data: {
  ticketId: string;
  username: string;
  email?: string;
  subject: string;
  message: string;
  status?: string;
  isReply?: boolean;
  threadId?: string | null;
}): Promise<{ success: boolean; threadId?: string }> {
  const webhookUrl = process.env.DISCORD_TICKETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return { success: false };
  }

  const embed: DiscordEmbed = {
    title: data.isReply ? `💬 New Reply on Ticket #${data.ticketId.substring(0, 8)}` : `🎫 New Support Ticket Created!`,
    description: data.message,
    url: `${SITE_URL}/dashboard/admin`,
    color: data.isReply ? BRAND_COLORS.blue : BRAND_COLORS.pink,
    fields: [
      { name: 'User', value: `@${data.username}`, inline: true },
      { name: 'Status', value: (data.status || 'OPEN').toUpperCase(), inline: true },
      { name: 'Subject', value: data.subject || 'No Subject', inline: false },
    ],
    footer: {
      text: 'Kyvo Support System • kyvo.fun',
    },
    timestamp: new Date().toISOString(),
  };

  if (data.email) {
    embed.fields?.push({ name: 'User Email', value: data.email, inline: true });
  }

  // Case 1: Posting a reply to an existing Discord Thread
  if (data.threadId) {
    try {
      const targetUrl = `${webhookUrl}?thread_id=${data.threadId}`;
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Kyvo Support Bot',
          embeds: [embed],
        }),
      });
      return { success: true, threadId: data.threadId };
    } catch (err) {
      console.error('Error posting to existing Discord thread:', err);
    }
  }

  // Case 2: New Ticket - Post message & create dedicated Thread
  try {
    const postRes = await fetch(`${webhookUrl}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Kyvo Support Bot',
        embeds: [embed],
      }),
    });

    if (!postRes.ok) return { success: false };

    const msgData = await postRes.json();
    const botToken = process.env.DISCORD_BOT_TOKEN;

    // Create Thread on message using Discord Bot API if bot token is available
    if (botToken && msgData?.id && msgData?.channel_id) {
      const threadRes = await fetch(
        `https://discord.com/api/v10/channels/${msgData.channel_id}/messages/${msgData.id}/threads`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `🎫 Ticket #${data.ticketId.substring(0, 8)} - @${data.username}`,
            auto_archive_duration: 1440,
          }),
        }
      );

      if (threadRes.ok) {
        const threadData = await threadRes.json();
        return { success: true, threadId: threadData.id };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error executing Discord Ticket Webhook:', err);
    return { success: false };
  }
}

/**
 * 2. New User Signup Notification (Growth Log)
 */
export async function sendDiscordSignupWebhook(data: {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}) {
  const profileUrl = `${SITE_URL}/${data.username}`;

  const embed: DiscordEmbed = {
    title: `🎉 New Creator Joined Kyvo!`,
    description: `Welcome **${data.displayName || data.username}** (@${data.username}) to the platform!`,
    url: profileUrl,
    color: BRAND_COLORS.yellow,
    author: {
      name: `@${data.username}`,
      url: profileUrl,
      icon_url: data.avatarUrl || `${SITE_URL}/icon.png`,
    },
    fields: [
      { name: 'Username', value: `@${data.username}`, inline: true },
      { name: 'Profile URL', value: `[kyvo.fun/${data.username}](${profileUrl})`, inline: true },
    ],
    footer: {
      text: 'Kyvo Growth Log • One Link. Everywhere.',
    },
    timestamp: new Date().toISOString(),
  };

  return executeWebhook('DISCORD_SIGNUPS_WEBHOOK_URL', {
    username: 'Kyvo Growth Bot',
    embeds: [embed],
  });
}

/**
 * 3. Moderation Audit Log Notification (Warn, Suspend, Ban, Badge Grant)
 */
export async function sendDiscordAuditWebhook(data: {
  adminUsername?: string;
  actionType: 'WARN' | 'SUSPEND' | 'BAN' | 'REINSTATE' | 'BADGE_GRANT' | 'TICKET_RESOLVED';
  targetUsername: string;
  reason?: string;
  badgeName?: string;
}) {
  let color = BRAND_COLORS.purple;
  let actionTitle = '🛡️ Admin Action Executed';

  switch (data.actionType) {
    case 'WARN':
      color = BRAND_COLORS.yellow;
      actionTitle = '⚠️ Official Warning Issued';
      break;
    case 'SUSPEND':
    case 'BAN':
      color = BRAND_COLORS.pink;
      actionTitle = '🚫 Account Suspended / Banned';
      break;
    case 'REINSTATE':
      color = BRAND_COLORS.green;
      actionTitle = '✅ Account Reinstated';
      break;
    case 'BADGE_GRANT':
      color = BRAND_COLORS.blue;
      actionTitle = '⭐ Badge Granted to User';
      break;
    case 'TICKET_RESOLVED':
      color = BRAND_COLORS.green;
      actionTitle = '✅ Support Ticket Resolved & Closed';
      break;
  }

  const fields: DiscordEmbedField[] = [
    { name: 'Target User', value: `@${data.targetUsername}`, inline: true },
    { name: 'Executed By', value: data.adminUsername ? `@${data.adminUsername}` : 'System Admin', inline: true },
  ];

  if (data.reason) {
    fields.push({ name: 'Reason', value: data.reason, inline: false });
  }

  if (data.badgeName) {
    fields.push({ name: 'Badge Name', value: data.badgeName, inline: true });
  }

  const embed: DiscordEmbed = {
    title: actionTitle,
    color,
    fields,
    footer: {
      text: 'Kyvo Audit Log • Security & Moderation',
    },
    timestamp: new Date().toISOString(),
  };

  return executeWebhook('DISCORD_AUDIT_WEBHOOK_URL', {
    username: 'Kyvo Security Bot',
    embeds: [embed],
  });
}

/**
 * 4. Analytics Profile Views Milestone Notification
 */
export async function sendDiscordMilestoneWebhook(data: {
  username: string;
  displayName?: string;
  viewsCount: number;
}) {
  const profileUrl = `${SITE_URL}/${data.username}`;

  const embed: DiscordEmbed = {
    title: `🚀 Profile View Milestone Reached!`,
    description: `Congratulations to **${data.displayName || data.username}** (@${data.username})! Their Kyvo profile just hit **${data.viewsCount.toLocaleString()} total views**!`,
    url: profileUrl,
    color: BRAND_COLORS.green,
    fields: [
      { name: 'Creator', value: `@${data.username}`, inline: true },
      { name: 'Total Views', value: `⚡ ${data.viewsCount.toLocaleString()}`, inline: true },
      { name: 'Visit Profile', value: `[kyvo.fun/${data.username}](${profileUrl})`, inline: false },
    ],
    footer: {
      text: 'Kyvo Analytics Milestones • kyvo.fun',
    },
    timestamp: new Date().toISOString(),
  };

  return executeWebhook('DISCORD_MILESTONES_WEBHOOK_URL', {
    username: 'Kyvo Milestone Bot',
    embeds: [embed],
  });
}
