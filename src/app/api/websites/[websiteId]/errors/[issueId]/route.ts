import { errorAccess } from '@/lib/errors/access';
import { errorQuerySchema, errorUpdateSchema } from '@/lib/errors/schema';
import prisma from '@/lib/prisma';
import { json } from '@/lib/response';
import { getErrorStats } from '@/queries/sql/errors/query';

type Context = { params: Promise<{ websiteId: string; issueId: string }> };
export async function GET(request: Request, context: Context) {
  const access = await errorAccess(request, await context.params, errorQuerySchema);
  if (access.response) return access.response;
  return json({
    ...access.issue,
    ...(await getErrorStats(access.scope, access.query, access.issue.id)),
  });
}
export async function PATCH(request: Request, context: Context) {
  const access = await errorAccess(request, await context.params, errorUpdateSchema, true);
  if (access.response) return access.response;
  await prisma.client.errorIssue.updateMany({
    where: { id: access.issue.id, websiteId: access.website.id },
    data: {
      status: access.body.status,
      resolvedAt: access.body.status === 'resolved' ? new Date() : null,
    },
  });
  return json({ ok: true });
}
