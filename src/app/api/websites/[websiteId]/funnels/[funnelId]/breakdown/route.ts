import { savedBreakdownQuerySchema, funnelParametersSchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canViewReport, canViewWebsiteSection } from '@/permissions';
import { getReport } from '@/queries/prisma';
import {
  type FunnelBreakdownParameters,
  getFunnelBreakdown,
} from '@/queries/sql/funnels/getFunnel';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; funnelId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, savedBreakdownQuerySchema);
  if (error) return error();
  const { websiteId, funnelId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'funnels'))) return unauthorized();
  const report = await getReport(funnelId);
  if (!report || report.websiteId !== websiteId || report.type !== 'funnel') return notFound();
  if (!(await canViewReport(auth, report))) return unauthorized();
  const parsed = funnelParametersSchema.safeParse(report.parameters);
  if (!parsed.success) return badRequest();
  const filters = await getQueryFilters(query, websiteId, auth);
  const parameters = {
    ...parsed.data,
    ...filters,
    field: query.field,
  } as FunnelBreakdownParameters;
  return json(await getFunnelBreakdown(websiteId, parameters, filters));
}
