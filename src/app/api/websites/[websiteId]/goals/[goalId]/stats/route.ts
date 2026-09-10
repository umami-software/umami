import { savedStatsQuerySchema, goalParametersSchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized, notFound, badRequest } from '@/lib/response';
import { canViewWebsiteSection, canViewReport } from '@/permissions';
import { getReport } from '@/queries/prisma';
import { getGoal, type GoalParameters } from '@/queries/sql/goals/getGoal';

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
