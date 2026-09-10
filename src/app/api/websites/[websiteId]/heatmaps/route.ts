import { heatmapQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getHeatmap, type HeatmapParameters } from '@/queries/sql/heatmap/getHeatmap';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, heatmapQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...query, ...filters } as HeatmapParameters;
  return json(await getHeatmap(websiteId, parameters));
}
