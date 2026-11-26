import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { alertRuleSchema } from '@/lib/schema';
import { canUpdateWebsite } from '@/permissions';
import { createAlertRule, getWebsiteAlertRules } from '@/queries/prisma/alert';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const rules = await getWebsiteAlertRules(websiteId);

  return json(rules);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, alertRuleSchema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { name, type, metric, threshold, windowMinutes, channelType, channelConfig, isEnabled } =
    body;

  const rule = await createAlertRule({
    id: uuid(),
    websiteId,
    name,
    type,
    metric,
    threshold,
    windowMinutes,
    channelType,
    channelConfig,
    isEnabled,
  });

  return json(rule);
}
