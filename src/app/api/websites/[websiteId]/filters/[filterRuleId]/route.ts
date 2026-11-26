import { clearFilterRulesCache } from '@/lib/filter-rules';
import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { filterRuleSchema } from '@/lib/schema';
import { canUpdateWebsite } from '@/permissions';
import { deleteFilterRule, getFilterRule, updateFilterRule } from '@/queries/prisma/filterRule';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; filterRuleId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, filterRuleId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const rule = await getFilterRule(filterRuleId);

  if (!rule || rule.websiteId !== websiteId) {
    return notFound();
  }

  return json(rule);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; filterRuleId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, filterRuleSchema.partial());

  if (error) {
    return error();
  }

  const { websiteId, filterRuleId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const existingRule = await getFilterRule(filterRuleId);

  if (!existingRule || existingRule.websiteId !== websiteId) {
    return notFound();
  }

  const updatedRule = await updateFilterRule(filterRuleId, body);

  clearFilterRulesCache(websiteId);

  return json(updatedRule);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; filterRuleId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, filterRuleId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const existingRule = await getFilterRule(filterRuleId);

  if (!existingRule || existingRule.websiteId !== websiteId) {
    return notFound();
  }

  await deleteFilterRule(filterRuleId);

  clearFilterRulesCache(websiteId);

  return json({ ok: true });
}
