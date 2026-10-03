import { commerceReportDefinitionSchema } from '@/lib/commerce-saved-reports';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import {
  canDeleteReport,
  canUpdateReport,
  canUpdateWebsite,
  canViewReport,
  canViewWebsiteSection,
} from '@/permissions';
import { deleteReport, getReport, updateReport } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; reportId: string }> },
) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  const { websiteId, reportId } = await params;
  const report = await getReport(reportId);
  if (!report || report.websiteId !== websiteId || report.type !== 'commerce') return notFound();
  if (
    !(await canViewReport(auth, report)) ||
    !(await canViewWebsiteSection(auth, websiteId, 'commerce'))
  )
    return unauthorized();
  return json(report);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; reportId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, commerceReportDefinitionSchema);
  if (error) return error();
  const { websiteId, reportId } = await params;
  const report = await getReport(reportId);
  if (!report || report.websiteId !== websiteId || report.type !== 'commerce') return notFound();
  if (!(await canUpdateReport(auth, report)) || !(await canUpdateWebsite(auth, websiteId)))
    return unauthorized();
  return json(
    await updateReport(report.id, {
      name: body.name,
      description: body.description,
      parameters: body.parameters,
    }),
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; reportId: string }> },
) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  const { websiteId, reportId } = await params;
  const report = await getReport(reportId);
  if (!report || report.websiteId !== websiteId || report.type !== 'commerce') return notFound();
  if (!(await canDeleteReport(auth, report)) || !(await canUpdateWebsite(auth, websiteId)))
    return unauthorized();
  await deleteReport(report.id);
  return ok();
}
