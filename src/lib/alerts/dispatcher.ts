import crypto from 'node:crypto';

export interface AlertPayload {
  websiteId: string;
  websiteName?: string;
  ruleName: string;
  type: string;
  metric: string;
  currentValue: number;
  threshold: number;
  windowMinutes: number;
  timestamp: string;
  message: string;
}

export interface ChannelConfig {
  url: string;
  secret?: string;
}

export interface DispatchResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export async function sendWebhook(
  config: ChannelConfig,
  payload: AlertPayload,
): Promise<DispatchResult> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Umami-Alert-Bot/1.0',
  };

  if (config.secret) {
    const signature = crypto.createHmac('sha256', config.secret).update(body).digest('hex');
    headers['x-umami-signature'] = signature;
  }

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        error: `Webhook responded with status ${res.status}: ${res.statusText}`,
      };
    }

    return { success: true, statusCode: res.status };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch webhook',
    };
  }
}

export async function sendSlackWebhook(
  config: ChannelConfig,
  payload: AlertPayload,
): Promise<DispatchResult> {
  const slackBody = {
    text: `🚨 Umami Alert: ${payload.ruleName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Alert: ${payload.ruleName}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Website:*\n${payload.websiteName || payload.websiteId}`,
          },
          {
            type: 'mrkdwn',
            text: `*Type:*\n\`${payload.type}\``,
          },
          {
            type: 'mrkdwn',
            text: `*Metric:*\n${payload.metric} (${payload.currentValue} / threshold ${payload.threshold})`,
          },
          {
            type: 'mrkdwn',
            text: `*Window:*\nLast ${payload.windowMinutes} minutes`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Triggered at: ${payload.timestamp}`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackBody),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        error: `Slack webhook returned status ${res.status}`,
      };
    }

    return { success: true, statusCode: res.status };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to send Slack webhook',
    };
  }
}

export async function sendDiscordWebhook(
  config: ChannelConfig,
  payload: AlertPayload,
): Promise<DispatchResult> {
  const isSpike = payload.type.includes('spike') || payload.type.includes('error');
  const embedColor = isSpike ? 0xef4444 : 0x3b82f6; // Red for spikes/errors, Blue otherwise

  const discordBody = {
    embeds: [
      {
        title: `🚨 Alert: ${payload.ruleName}`,
        description: payload.message,
        color: embedColor,
        fields: [
          {
            name: 'Website',
            value: payload.websiteName || payload.websiteId,
            inline: true,
          },
          {
            name: 'Metric',
            value: `${payload.metric}: **${payload.currentValue}**`,
            inline: true,
          },
          {
            name: 'Threshold',
            value: `${payload.threshold} (over ${payload.windowMinutes}m)`,
            inline: true,
          },
        ],
        timestamp: payload.timestamp,
        footer: {
          text: 'Umami Analytics Alerts',
        },
      },
    ],
  };

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordBody),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        error: `Discord webhook returned status ${res.status}`,
      };
    }

    return { success: true, statusCode: res.status };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to send Discord webhook',
    };
  }
}

export async function dispatchAlert(
  channelType: string,
  config: ChannelConfig,
  payload: AlertPayload,
): Promise<DispatchResult> {
  switch (channelType.toLowerCase()) {
    case 'slack':
      return sendSlackWebhook(config, payload);
    case 'discord':
      return sendDiscordWebhook(config, payload);
    default:
      return sendWebhook(config, payload);
  }
}
