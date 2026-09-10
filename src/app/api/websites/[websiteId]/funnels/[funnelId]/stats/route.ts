import { savedStatsQuerySchema, funnelParametersSchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized, notFound, badRequest } from '@/lib/response';
import { canViewWebsiteSection, canViewReport } from '@/permissions';
import { getReport } from '@/queries/prisma';
import { getFunnel, type FunnelParameters } from '@/queries/sql/funnels/getFunnel';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; funnelId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, savedStatsQuerySchema);
  if (error) return error();
  const { websiteId, funnelId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'funnels'))) return unauthorized();
  const report = await getReport(funnelId);
  if (!report || report.websiteId !== websiteId || report.type !== 'funnel') return notFound();
  if (!(await canViewReport(auth, report))) return unauthorized();
  const parsed = funnelParametersSchema.safeParse(report.parameters);
  if (!parsed.success) return badRequest();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...parsed.data, ...filters } as FunnelParameters;
  return json(await getFunnel(websiteId, parameters, filters));
}
