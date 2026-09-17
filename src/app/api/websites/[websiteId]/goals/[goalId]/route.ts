import { goalDefinitionSchema } from '@/lib/analytics-schema';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { canDeleteReport, canUpdateReport, canViewReport } from '@/permissions';
import { deleteReport, getReport, updateReport } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; goalId: string }> },
) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  const { websiteId, goalId } = await params;
  const report = await getReport(goalId);
  if (!report || report.websiteId !== websiteId || report.type !== 'goal') return notFound();
  if (!(await canViewReport(auth, report))) return unauthorized();
  return json(report);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; goalId: string }> },
) {
  const { auth, body, error } = await parseRequest(request, goalDefinitionSchema);
  if (error) return error();
  const { websiteId, goalId } = await params;
  const report = await getReport(goalId);
  if (!report || report.websiteId !== websiteId || report.type !== 'goal') return notFound();
  if (!(await canUpdateReport(auth, report))) return unauthorized();
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
  { params }: { params: Promise<{ websiteId: string; goalId: string }> },
) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  const { websiteId, goalId } = await params;
  const report = await getReport(goalId);
  if (!report || report.websiteId !== websiteId || report.type !== 'goal') return notFound();
  if (!(await canDeleteReport(auth, report))) return unauthorized();
  await deleteReport(report.id);
  return ok();
}
