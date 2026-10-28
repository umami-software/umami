import { createHmac } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import type { WidgetDelivery } from './marketing-widgets';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface LeadPayload {
  leadId: string;
  widgetName: string;
  widgetType: string;
  website: string;
  pageUrl?: string;
  data: Record<string, string>;
  createdAt: string;
}

function isPublicAddress(address: string) {
  try {
    const range = ipaddr.process(address).range();
    return range === 'unicast';
  } catch {
    return false;
  }
}

/** http(s) URL without credentials whose every resolved address is public (no SSRF into the cluster). */
export async function assertPublicUrl(raw: string, allowHttp = false) {
  const url = new URL(raw);
  const okProtocol = url.protocol === 'https:' || (allowHttp && url.protocol === 'http:');

  if (!okProtocol || url.username || url.password) {
    throw new Error('URL must be http(s) without credentials');
  }

  const addrs = await lookup(url.hostname, { all: true });

  if (!addrs.length || !addrs.every(a => isPublicAddress(a.address))) {
    throw new Error('Host resolves to a non-public address');
  }

  return url;
}

/** https only (webhooks). */
export async function assertSafeWebhookUrl(raw: string) {
  try {
    return await assertPublicUrl(raw, false);
  } catch (e: any) {
    throw new Error(`Webhook: ${e.message}`);
  }
}

export async function sendTelegram(chatId: string, payload: LeadPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  const lines = Object.entries(payload.data).map(
    ([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(String(v))}`,
  );
  const textMsg = [
    `<b>New lead</b> — ${escapeHtml(payload.widgetName)}`,
    escapeHtml(payload.website),
    ...lines,
    payload.pageUrl ? `Page: ${escapeHtml(payload.pageUrl)}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: textMsg,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Telegram HTTP ${res.status}`);
  }
}

export async function sendWebhook(url: string, secret: string, payload: LeadPayload) {
  const safe = await assertSafeWebhookUrl(url);
  const body = JSON.stringify(payload);
  const signature = secret ? createHmac('sha256', secret).update(body).digest('hex') : '';

  const res = await fetch(safe, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'umami-widgets/1',
      ...(signature ? { 'x-umami-signature': `sha256=${signature}` } : {}),
    },
    body,
    signal: AbortSignal.timeout(5000),
  });

  if (res.status >= 300) {
    throw new Error(`Webhook HTTP ${res.status}`);
  }
}

/** Fan out to all enabled channels; never throws, returns per-channel status. */
export async function deliverLead(delivery: WidgetDelivery, payload: LeadPayload) {
  const status: Record<string, string> = {};
  const jobs: Promise<void>[] = [];

  if (delivery.telegram?.enabled && delivery.telegram.chatId) {
    jobs.push(
      sendTelegram(delivery.telegram.chatId, payload).then(
        () => {
          status.telegram = 'ok';
        },
        e => {
          status.telegram = `error: ${e.message}`.slice(0, 200);
        },
      ),
    );
  }

  if (delivery.webhook?.enabled && delivery.webhook.url) {
    jobs.push(
      sendWebhook(delivery.webhook.url, delivery.webhook.secret, payload).then(
        () => {
          status.webhook = 'ok';
        },
        e => {
          status.webhook = `error: ${e.message}`.slice(0, 200);
        },
      ),
    );
  }

  await Promise.all(jobs);
  return status;
}
