import { dispatchAlert } from '@/lib/alerts/dispatcher';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';
import { getAlertRule } from '@/queries/prisma/alert';
import { getWebsite } from '@/queries/prisma/website';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; alertRuleId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, alertRuleId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const rule = await getAlertRule(alertRuleId);

  if (!rule || rule.websiteId !== websiteId) {
    return notFound();
  }

  const website = await getWebsite(websiteId);

  const testPayload = {
    websiteId,
    websiteName: website?.name || websiteId,
    ruleName: rule.name,
    type: rule.type,
    metric: rule.metric,
    currentValue: Number(rule.threshold),
    threshold: Number(rule.threshold),
    windowMinutes: rule.windowMinutes,
    timestamp: new Date().toISOString(),
    message: `[TEST] Umami alert test notification for rule "${rule.name}". Channel configuration is verified!`,
  };

  const result = await dispatchAlert(rule.channelType, rule.channelConfig as any, testPayload);

  if (!result.success) {
    return badRequest(result);
  }

  return json(result);
}
