import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { reportSchema } from '@/lib/schema';
import { canDeleteWebsite, canUpdateWebsite, canViewReport } from '@/permissions';
import { deleteReport, getReport, updateReport } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { reportId } = await params;

  const report = await getReport(reportId);

  if (!(await canViewReport(auth, report))) {
    return unauthorized();
  }

  return json(report);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, reportSchema);

  if (error) {
    return error();
  }

  const { reportId } = await params;
  const { websiteId, type, name, description, parameters } = body;

  const report = await getReport(reportId);

  if (!report) {
    return notFound();
  }

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await updateReport(reportId, {
    websiteId,
    userId: auth.user.id,
    type,
    name,
    description,
    parameters,
  } as any);

  return json(result);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { reportId } = await params;
  const report = await getReport(reportId);

  if (!(await canDeleteWebsite(auth, report.websiteId))) {
    return unauthorized();
  }

  await deleteReport(reportId);

  return ok();
}
