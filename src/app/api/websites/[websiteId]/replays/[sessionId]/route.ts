import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { getReplayChunks } from '@/queries/sql';

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

  const chunks = await getReplayChunks(websiteId, sessionId);

  const allEvents = chunks.flatMap(chunk => chunk.events);
  const startedAt = chunks.length > 0 ? chunks[0].startedAt : null;
  const endedAt = chunks.length > 0 ? chunks[chunks.length - 1].endedAt : null;

  return json({
    events: allEvents,
    startedAt,
    endedAt,
    eventCount: allEvents.length,
    chunkCount: chunks.length,
  });
}
