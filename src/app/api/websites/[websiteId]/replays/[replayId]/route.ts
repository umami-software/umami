import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsite } from '@/permissions';
import {
  createReplaySaved,
  deleteReplaySaved,
  getReplaySaved,
} from '@/queries/prisma/sessionReplay';
import { getReplayChunks } from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; replayId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, replayId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const [chunks, isSaved] = await Promise.all([
    getReplayChunks(websiteId, replayId),
    getReplaySaved(websiteId, replayId),
  ]);

  const allEvents = chunks.flatMap(chunk => chunk.events);
  const sessionId = chunks.length > 0 ? chunks[0].sessionId : null;
  const startedAt = chunks.length > 0 ? chunks[0].startedAt : null;
  const endedAt = chunks.length > 0 ? chunks[chunks.length - 1].endedAt : null;

  return json({
    sessionId,
    events: allEvents,
    startedAt,
    endedAt,
    eventCount: allEvents.length,
    chunkCount: chunks.length,
    isSaved,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; replayId: string }> },
) {
  const schema = z.object({
    isSaved: z.boolean(),
    name: z.string().max(100).optional(),
  });
  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, replayId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  if (body.isSaved) {
    await createReplaySaved(websiteId, replayId, body.name ?? '');
  } else {
    await deleteReplaySaved(websiteId, replayId);
  }

  return json({ ok: true });
}
