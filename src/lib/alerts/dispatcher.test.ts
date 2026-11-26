import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AlertPayload,
  dispatchAlert,
  sendDiscordWebhook,
  sendSlackWebhook,
  sendWebhook,
} from './dispatcher';

describe('Alert Dispatcher', () => {
  const mockPayload: AlertPayload = {
    websiteId: 'website-123',
    websiteName: 'Production Website',
    ruleName: 'Traffic Surge',
    type: 'traffic_spike',
    metric: 'pageviews',
    currentValue: 1500,
    threshold: 1000,
    windowMinutes: 15,
    timestamp: '2026-11-01T20:00:00.000Z',
    message: 'Traffic Surge triggered: pageviews reached 1500 in the last 15m',
  };

  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendWebhook', () => {
    it('dispatches json payload with HMAC signature when secret is provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const secret = 'super-secret-key';
      const result = await sendWebhook({ url: 'https://example.com/webhook', secret }, mockPayload);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('https://example.com/webhook');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      // Verify HMAC signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(mockPayload))
        .digest('hex');
      expect(options.headers['x-umami-signature']).toBe(expectedSignature);
    });

    it('returns error when endpoint responds with 500 error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await sendWebhook({ url: 'https://example.com/webhook' }, mockPayload);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toContain('Webhook responded with status 500');
    });

    it('handles network failure gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Connection timed out'));

      const result = await sendWebhook({ url: 'https://example.com/webhook' }, mockPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timed out');
    });
  });

  describe('sendSlackWebhook', () => {
    it('constructs Slack BlockKit format properly', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendSlackWebhook(
        { url: 'https://hooks.slack.com/services/xxx' },
        mockPayload,
      );

      expect(result.success).toBe(true);
      const [, options] = fetchMock.mock.calls[0];
      const parsedBody = JSON.parse(options.body);

      expect(parsedBody.text).toContain('🚨 Umami Alert: Traffic Surge');
      expect(parsedBody.blocks).toBeDefined();
      expect(parsedBody.blocks[0].text.text).toContain('Alert: Traffic Surge');
    });
  });

  describe('sendDiscordWebhook', () => {
    it('constructs Discord Embed format with red color for spike alerts', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await sendDiscordWebhook(
        { url: 'https://discord.com/api/webhooks/xxx' },
        mockPayload,
      );

      expect(result.success).toBe(true);
      const [, options] = fetchMock.mock.calls[0];
      const parsedBody = JSON.parse(options.body);

      expect(parsedBody.embeds).toBeDefined();
      expect(parsedBody.embeds[0].color).toBe(0xef4444); // Red color for spikes
      expect(parsedBody.embeds[0].title).toContain('Traffic Surge');
    });
  });

  describe('dispatchAlert router', () => {
    it('routes slack channel type to Slack webhook', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await dispatchAlert('slack', { url: 'https://hooks.slack.com' }, mockPayload);
      expect(result.success).toBe(true);
      const [, options] = fetchMock.mock.calls[0];
      const parsedBody = JSON.parse(options.body);
      expect(parsedBody.blocks).toBeDefined();
    });

    it('routes discord channel type to Discord webhook', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await dispatchAlert(
        'discord',
        { url: 'https://discord.com/api' },
        mockPayload,
      );
      expect(result.success).toBe(true);
      const [, options] = fetchMock.mock.calls[0];
      const parsedBody = JSON.parse(options.body);
      expect(parsedBody.embeds).toBeDefined();
    });
  });
});
