import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { alertRuleSchema } from '@/lib/schema';
import { canUpdateWebsite } from '@/permissions';
import { deleteAlertRule, getAlertRule, updateAlertRule } from '@/queries/prisma/alert';

export async function GET(
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

  return json(rule);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; alertRuleId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, alertRuleSchema.partial());

  if (error) {
    return error();
  }

  const { websiteId, alertRuleId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const existingRule = await getAlertRule(alertRuleId);

  if (!existingRule || existingRule.websiteId !== websiteId) {
    return notFound();
  }

  const updatedRule = await updateAlertRule(alertRuleId, body);

  return json(updatedRule);
}

export async function DELETE(
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

  const existingRule = await getAlertRule(alertRuleId);

  if (!existingRule || existingRule.websiteId !== websiteId) {
    return notFound();
  }

  await deleteAlertRule(alertRuleId);

  return json({ ok: true });
}
