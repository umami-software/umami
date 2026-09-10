import { attributionQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getAttribution, type AttributionParameters } from '@/queries/sql/attribution/getAttribution';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, attributionQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'attribution'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...query, ...filters } as AttributionParameters;
  return json(await getAttribution(websiteId, parameters, filters));
}
