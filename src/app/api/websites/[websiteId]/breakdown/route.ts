import { breakdownQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getBreakdown, type BreakdownParameters } from '@/queries/sql/breakdown/getBreakdown';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, breakdownQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'breakdown'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...query, ...filters } as BreakdownParameters;
  return json(await getBreakdown(websiteId, parameters, filters));
}
