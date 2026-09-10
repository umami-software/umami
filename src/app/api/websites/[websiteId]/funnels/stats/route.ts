import { funnelQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';

import { getFunnel, type FunnelParameters } from '@/queries/sql/funnels/getFunnel';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, funnelQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'funnels'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...query, ...filters } as FunnelParameters;
  return json(await getFunnel(websiteId, parameters, filters));
}
