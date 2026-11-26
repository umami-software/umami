import type { AlertRule } from '@/generated/prisma/client';
import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import { createAlertNotification, updateAlertRule } from '@/queries/prisma/alert';
import { getWebsiteStats } from '@/queries/sql';
import { type AlertPayload, type DispatchResult, dispatchAlert } from './dispatcher';

export interface EvaluationResult {
  ruleId: string;
  triggered: boolean;
  currentValue: number;
  threshold: number;
  dispatchResult?: DispatchResult;
  reason?: string;
}

export async function evaluateAlertRule(
  rule: AlertRule,
  websiteName?: string,
): Promise<EvaluationResult> {
  if (!rule.isEnabled) {
    return {
      ruleId: rule.id,
      triggered: false,
      currentValue: 0,
      threshold: Number(rule.threshold),
      reason: 'Rule is disabled',
    };
  }

  const windowMs = rule.windowMinutes * 60 * 1000;
  const now = new Date();
  const startDate = new Date(now.getTime() - windowMs);
  const threshold = Number(rule.threshold);

  // Check cooldown debounce
  if (rule.lastTriggeredAt) {
    const elapsed = now.getTime() - new Date(rule.lastTriggeredAt).getTime();
    if (elapsed < windowMs) {
      return {
        ruleId: rule.id,
        triggered: false,
        currentValue: 0,
        threshold,
        reason: `Debounced (last triggered ${Math.round(elapsed / 60000)}m ago, cooldown is ${rule.windowMinutes}m)`,
      };
    }
  }

  let currentValue = 0;

  if (rule.metric === 'pageviews' || rule.metric === 'visitors') {
    const stats = await getWebsiteStats(rule.websiteId, { startDate, endDate: now });
    const statRow = Array.isArray(stats) ? stats[0] : (stats as any);
    currentValue = rule.metric === 'pageviews' ? statRow?.pageviews || 0 : statRow?.visitors || 0;
  } else if (rule.metric === 'errors') {
    const errorCount = await prisma.client.errorEvent.count({
      where: {
        websiteId: rule.websiteId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
    });
    currentValue = errorCount;
  }

  let triggered = false;
  let conditionText = '';

  switch (rule.type) {
    case 'traffic_spike':
    case 'error_spike':
      triggered = currentValue >= threshold;
      conditionText = `exceeded threshold of ${threshold}`;
      break;
    case 'traffic_drop':
      triggered = currentValue <= threshold;
      conditionText = `dropped below threshold of ${threshold}`;
      break;
    default:
      triggered = currentValue >= threshold;
      conditionText = `reached threshold of ${threshold}`;
      break;
  }

  if (!triggered) {
    return {
      ruleId: rule.id,
      triggered: false,
      currentValue,
      threshold,
      reason: `Current value (${currentValue}) did not meet trigger condition`,
    };
  }

  // Triggered! Prepare payload and dispatch
  const message = `Alert "${rule.name}" triggered: ${rule.metric} reached ${currentValue} in the last ${rule.windowMinutes}m (${conditionText}).`;

  const payload: AlertPayload = {
    websiteId: rule.websiteId,
    websiteName,
    ruleName: rule.name,
    type: rule.type,
    metric: rule.metric,
    currentValue,
    threshold,
    windowMinutes: rule.windowMinutes,
    timestamp: now.toISOString(),
    message,
  };

  const dispatchResult = await dispatchAlert(rule.channelType, rule.channelConfig as any, payload);

  // Record notification in DB
  await createAlertNotification({
    id: uuid(),
    alertRuleId: rule.id,
    websiteId: rule.websiteId,
    title: `Alert Triggered: ${rule.name}`,
    message,
    channelType: rule.channelType,
    status: dispatchResult.success ? 'success' : 'failed',
    details: dispatchResult as any,
    createdAt: now,
  });

  // Update lastTriggeredAt
  await updateAlertRule(rule.id, {
    lastTriggeredAt: now,
  });

  return {
    ruleId: rule.id,
    triggered: true,
    currentValue,
    threshold,
    dispatchResult,
  };
}
