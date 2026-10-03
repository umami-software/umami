import { getCommerceRequestParameters } from '@/lib/commerce-reports';
import {
  commerceReportParametersSchema,
  resolveCommerceReportDates,
  savedCommerceStatsQuerySchema,
} from '@/lib/commerce-saved-reports';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { canViewReport, canViewWebsiteSection } from '@/permissions';
import { getReport } from '@/queries/prisma';
import { getCommerceCheckout } from '@/queries/sql/commerce/getCommerceCheckout';
import { getCommerceProducts } from '@/queries/sql/commerce/getCommerceProducts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; reportId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, savedCommerceStatsQuerySchema);
  if (error) return error();
  const { websiteId, reportId } = await params;
  const report = await getReport(reportId);
  if (!report || report.websiteId !== websiteId || report.type !== 'commerce') return notFound();
  if (
    !(await canViewReport(auth, report)) ||
    !(await canViewWebsiteSection(auth, websiteId, 'commerce'))
  )
    return unauthorized();
  const parsed = commerceReportParametersSchema.safeParse(report.parameters);
  if (!parsed.success) return badRequest({ message: 'This report definition needs updating.' });
  const definition = parsed.data;
  const dates =
    query.startAt === undefined
      ? resolveCommerceReportDates(definition)
      : { startAt: query.startAt, endAt: query.endAt };
  const filters = await getQueryFilters(
    {
      ...definition.filters,
      ...dates,
      timezone: definition.timezone,
      page: query.page,
      pageSize: query.pageSize,
      search: definition.search,
    },
    websiteId,
  );
  const parameters = getCommerceRequestParameters(definition, filters);
  const data =
    definition.type === 'products'
      ? await getCommerceProducts(websiteId, parameters, filters, definition)
      : await getCommerceCheckout(websiteId, parameters, filters);
  return json({ report, data });
}
