import { uuid } from '@/lib/crypto';
import { clearFilterRulesCache } from '@/lib/filter-rules';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterRuleSchema } from '@/lib/schema';
import { canUpdateWebsite } from '@/permissions';
import { createFilterRule, getWebsiteFilterRules } from '@/queries/prisma/filterRule';

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

  const rules = await getWebsiteFilterRules(websiteId);

  return json(rules);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, filterRuleSchema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { name, type, value, action, isEnabled } = body;

  const rule = await createFilterRule({
    id: uuid(),
    websiteId,
    name,
    type,
    value,
    action,
    isEnabled,
  });

  clearFilterRulesCache(websiteId);

  return json(rule);
}
