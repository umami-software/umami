import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, unauthorized } from '@/lib/response';
import { canDeleteWebsite, canViewWebsite } from '@/permissions';
import { deleteSession } from '@/queries/prisma';
import { getWebsiteSession } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getWebsiteSession(websiteId, sessionId);

  return json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (process.env.CLICKHOUSE_URL) {
    return badRequest({ message: 'Deleting individual sessions is not supported with ClickHouse.' });
  }

  const { websiteId, sessionId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await deleteSession(websiteId, sessionId);

  return ok();
}
