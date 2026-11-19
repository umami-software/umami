import { goalParametersSchema, savedStatsQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canViewReport, canViewWebsiteSection } from '@/permissions';
import { getReport } from '@/queries/prisma';
import { type GoalParameters, getGoal } from '@/queries/sql/goals/getGoal';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; goalId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, savedStatsQuerySchema);
  if (error) return error();
  const { websiteId, goalId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'goals'))) return unauthorized();
  const report = await getReport(goalId);
  if (!report || report.websiteId !== websiteId || report.type !== 'goal') return notFound();
  if (!(await canViewReport(auth, report))) return unauthorized();
  const parsed = goalParametersSchema.safeParse(report.parameters);
  if (!parsed.success) return badRequest();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...parsed.data, ...filters } as GoalParameters;
  return json(await getGoal(websiteId, parameters, filters));
}
