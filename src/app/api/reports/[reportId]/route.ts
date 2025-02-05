import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { deleteReport, getReport, updateReport } from '@/queries';
import { canDeleteReport, canUpdateReport, canViewReport } from '@/lib/auth';
import { unauthorized, json, notFound, ok } from '@/lib/response';
import { reportTypeParam } from '@/lib/schema';

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

  report.parameters = JSON.parse(report.parameters);

  return json(report);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const schema = z.object({
    websiteId: z.string().uuid(),
    type: reportTypeParam,
    name: z.string().max(200),
    description: z.string().max(500),
    parameters: z.object({}).passthrough(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { reportId } = await params;
  const { websiteId, type, name, description, parameters } = body;

  const report = await getReport(reportId);

  if (!report) {
    return notFound();
  }

  if (!(await canUpdateReport(auth, report))) {
    return unauthorized();
  }

  const result = await updateReport(reportId, {
    websiteId,
    userId: auth.user.id,
    type,
    name,
    description,
    parameters: JSON.stringify(parameters),
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

  if (!(await canDeleteReport(auth, report))) {
    return unauthorized();
  }

  await deleteReport(reportId);

  return ok();
}
