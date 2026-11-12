import { errorAccess } from '@/lib/errors/access';
import { json, notFound } from '@/lib/response';
import { getErrorEvent } from '@/queries/sql/errors/query';

export async function GET(
  request: Request,
  context: { params: Promise<{ websiteId: string; issueId: string; eventId: string }> },
) {
  const params = await context.params;
  const access = await errorAccess(request, params);
  if (access.response) return access.response;
  const event = await getErrorEvent(access.scope, params.issueId, params.eventId);
  return event ? json(event) : notFound();
}
