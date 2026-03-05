import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getPerformance, type PerformanceParameters } from '@/queries/sql/reports/getPerformance';
import { getPerformanceMetrics } from '@/queries/sql/reports/getPerformanceMetrics';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const parameters = await setWebsiteDate(websiteId, body.parameters);
  const filters = await getQueryFilters(body.filters, websiteId);

  const [{ chart, summary }, pages, pageTitles, devices, browsers] = await Promise.all([
    getPerformance(websiteId, parameters as PerformanceParameters, filters),
    getPerformanceMetrics(websiteId, parameters as PerformanceParameters, filters, 'url_path', 500),
    getPerformanceMetrics(
      websiteId,
      parameters as PerformanceParameters,
      filters,
      'page_title',
      500,
    ),
    getPerformanceMetrics(websiteId, parameters as PerformanceParameters, filters, 'device'),
    getPerformanceMetrics(websiteId, parameters as PerformanceParameters, filters, 'browser', 500),
  ]);

  return json({ chart, summary, pages, pageTitles, devices, browsers });
}
