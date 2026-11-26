import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AlertRule } from '@/generated/prisma/client';
import { evaluateAlertRule } from './evaluator';

const {
  getWebsiteStatsMock,
  errorCountMock,
  createAlertNotificationMock,
  updateAlertRuleMock,
  dispatchAlertMock,
} = vi.hoisted(() => ({
  getWebsiteStatsMock: vi.fn(),
  errorCountMock: vi.fn(),
  createAlertNotificationMock: vi.fn(),
  updateAlertRuleMock: vi.fn(),
  dispatchAlertMock: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getWebsiteStats: getWebsiteStatsMock,
}));

vi.mock('@/queries/prisma/alert', () => ({
  createAlertNotification: createAlertNotificationMock,
  updateAlertRule: updateAlertRuleMock,
}));

vi.mock('./dispatcher', () => ({
  dispatchAlert: dispatchAlertMock,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      errorEvent: {
        count: errorCountMock,
      },
    },
  },
}));

describe('Alert Evaluator', () => {
  const baseRule: AlertRule = {
    id: 'rule-1',
    websiteId: 'website-1',
    name: 'Spike Watcher',
    type: 'traffic_spike',
    metric: 'pageviews',
    threshold: 100 as any,
    windowMinutes: 15,
    channelType: 'webhook',
    channelConfig: { url: 'https://example.com' },
    isEnabled: true,
    lastTriggeredAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips evaluation when rule is disabled', async () => {
    const disabledRule = { ...baseRule, isEnabled: false };
    const result = await evaluateAlertRule(disabledRule);

    expect(result.triggered).toBe(false);
    expect(result.reason).toBe('Rule is disabled');
    expect(dispatchAlertMock).not.toHaveBeenCalled();
  });

  it('skips evaluation when within cooldown debounce window', async () => {
    const recentlyTriggeredRule: AlertRule = {
      ...baseRule,
      lastTriggeredAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago (< 15 mins)
    };

    const result = await evaluateAlertRule(recentlyTriggeredRule);

    expect(result.triggered).toBe(false);
    expect(result.reason).toContain('Debounced');
    expect(dispatchAlertMock).not.toHaveBeenCalled();
  });

  it('triggers when pageviews exceed threshold', async () => {
    getWebsiteStatsMock.mockResolvedValueOnce({
      pageviews: 250,
      visitors: 80,
    });
    dispatchAlertMock.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });

    const result = await evaluateAlertRule(baseRule, 'My App');

    expect(result.triggered).toBe(true);
    expect(result.currentValue).toBe(250);
    expect(dispatchAlertMock).toHaveBeenCalledTimes(1);
    expect(createAlertNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        alertRuleId: 'rule-1',
        websiteId: 'website-1',
        status: 'success',
      }),
    );
    expect(updateAlertRuleMock).toHaveBeenCalledWith(
      'rule-1',
      expect.objectContaining({
        lastTriggeredAt: expect.any(Date),
      }),
    );
  });

  it('does not trigger when pageviews are below threshold', async () => {
    getWebsiteStatsMock.mockResolvedValueOnce({
      pageviews: 45,
      visitors: 12,
    });

    const result = await evaluateAlertRule(baseRule);

    expect(result.triggered).toBe(false);
    expect(result.currentValue).toBe(45);
    expect(dispatchAlertMock).not.toHaveBeenCalled();
    expect(createAlertNotificationMock).not.toHaveBeenCalled();
  });

  it('triggers on error spike metric', async () => {
    const errorRule: AlertRule = {
      ...baseRule,
      type: 'error_spike',
      metric: 'errors',
      threshold: 10 as any,
    };

    errorCountMock.mockResolvedValueOnce(25);
    dispatchAlertMock.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });

    const result = await evaluateAlertRule(errorRule);

    expect(result.triggered).toBe(true);
    expect(result.currentValue).toBe(25);
    expect(dispatchAlertMock).toHaveBeenCalledTimes(1);
  });
});
