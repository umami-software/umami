import { performanceMetricsQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import type { PerformanceParameters } from '@/queries/sql/performance/getPerformance';
import { getPerformanceMetrics } from '@/queries/sql/performance/getPerformanceMetrics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, performanceMetricsQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'performance'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...query, ...filters } as PerformanceParameters;
  const columns = { path: 'url_path', title: 'page_title', device: 'device', browser: 'browser' };
  return json(
    await getPerformanceMetrics(
      websiteId,
      parameters,
      filters,
      columns[query.type],
      query.limit ?? (query.type === 'device' ? undefined : 500),
    ),
  );
}
