import { restoreReplayEventFragments } from '@/lib/replay';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getReplayChunks } from '@/queries/sql';

function getEventTimestamp(event: any): number | null {
  const timestamp = Number(event?.timestamp);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function parseOptionalInteger(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : undefined;
}

function mergeReplayEvents(
  chunks: Awaited<ReturnType<typeof getReplayChunks>>,
  {
    until,
    endChunkIndex,
    endEventIndex,
  }: { until?: number; endChunkIndex?: number; endEventIndex?: number },
) {
  const events: any[] = [];
  let isSorted = true;
  let lastTimestamp = -Infinity;

  for (const chunk of chunks) {
    if (endChunkIndex !== undefined && chunk.chunkIndex > endChunkIndex) {
      continue;
    }

    for (let chunkEventIndex = 0; chunkEventIndex < chunk.events.length; chunkEventIndex++) {
      const event = chunk.events[chunkEventIndex];
      const timestamp = getEventTimestamp(event);

      if (chunk.chunkIndex === endChunkIndex && endEventIndex !== undefined) {
        if (chunkEventIndex > endEventIndex) {
          continue;
        }
      }

      if (until !== undefined && timestamp !== null && timestamp > until) {
        continue;
      }

      if (timestamp !== null) {
        if (timestamp < lastTimestamp) {
          isSorted = false;
        } else {
          lastTimestamp = timestamp;
        }
      }

      events.push(event);
    }
  }

  if (!isSorted) {
    events.sort((a, b) => (getEventTimestamp(a) ?? 0) - (getEventTimestamp(b) ?? 0));
  }

  return events;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; replayId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, replayId } = await params;
  const searchParams = new URL(request.url).searchParams;
  const until = parseOptionalInteger(searchParams.get('until'));
  const endChunkIndex = parseOptionalInteger(searchParams.get('chunkIndex'));
  const endEventIndex = parseOptionalInteger(searchParams.get('eventIndex'));
  const endAt = until !== undefined ? new Date(until) : undefined;

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const chunks = await getReplayChunks(websiteId, replayId, { endAt, endChunkIndex });
  const allEvents = restoreReplayEventFragments(
    mergeReplayEvents(chunks, { until, endChunkIndex, endEventIndex }),
  );
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
  });
}
