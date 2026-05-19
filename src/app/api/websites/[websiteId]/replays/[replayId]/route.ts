import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { getReplayChunks } from '@/queries/sql';

const RRWEB_TYPE_FULL_SNAPSHOT = 2;
const RRWEB_TYPE_META = 4;
const SNAPSHOT_WINDOW_CHUNK_LIMIT = 6;
const SNAPSHOT_WINDOW_MAX_CHUNKS = 96;

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

function trimChunksToCheckpoint(
  chunks: Awaited<ReturnType<typeof getReplayChunks>>,
  { endChunkIndex, endEventIndex }: { endChunkIndex?: number; endEventIndex?: number },
) {
  let lastMetaChunkIndex: number | null = null;
  let checkpointStartChunkIndex: number | null = null;
  let hasMeta = false;

  for (const chunk of chunks) {
    if (endChunkIndex !== undefined && chunk.chunkIndex > endChunkIndex) {
      break;
    }

    for (let chunkEventIndex = 0; chunkEventIndex < chunk.events.length; chunkEventIndex++) {
      if (
        chunk.chunkIndex === endChunkIndex &&
        endEventIndex !== undefined &&
        chunkEventIndex > endEventIndex
      ) {
        break;
      }

      const event = chunk.events[chunkEventIndex];

      if (event?.type === RRWEB_TYPE_META) {
        lastMetaChunkIndex = chunk.chunkIndex;
        hasMeta = true;
      }

      if (event?.type === RRWEB_TYPE_FULL_SNAPSHOT) {
        checkpointStartChunkIndex = lastMetaChunkIndex ?? chunk.chunkIndex;
      }
    }
  }

  if (checkpointStartChunkIndex === null) {
    return { chunks, foundCheckpoint: false, hasMeta };
  }

  return {
    chunks: chunks.filter(chunk => chunk.chunkIndex >= checkpointStartChunkIndex),
    foundCheckpoint: true,
    hasMeta,
  };
}

async function getReplaySnapshotChunks(
  websiteId: string,
  replayId: string,
  { endAt, endChunkIndex, endEventIndex }: { endAt?: Date; endChunkIndex: number; endEventIndex?: number },
) {
  let limit = SNAPSHOT_WINDOW_CHUNK_LIMIT;

  while (limit <= SNAPSHOT_WINDOW_MAX_CHUNKS) {
    const descChunks = await getReplayChunks(websiteId, replayId, {
      endAt,
      endChunkIndex,
      limit,
      order: 'desc',
    });

    const chunks = [...descChunks].reverse();
    const { chunks: trimmedChunks, foundCheckpoint, hasMeta } = trimChunksToCheckpoint(chunks, {
      endChunkIndex,
      endEventIndex,
    });

    if (foundCheckpoint || descChunks.length < limit) {
      if (hasMeta || trimmedChunks.length === 0) {
        return trimmedChunks;
      }

      const initialChunks = await getReplayChunks(websiteId, replayId, {
        limit: 1,
        order: 'asc',
      });

      if (!initialChunks.length) {
        return trimmedChunks;
      }

      const initialChunk = initialChunks[0];

      if (trimmedChunks.some(chunk => chunk.chunkIndex === initialChunk.chunkIndex)) {
        return trimmedChunks;
      }

      return [initialChunk, ...trimmedChunks];
    }

    limit *= 2;
  }

  return getReplayChunks(websiteId, replayId, { endAt, endChunkIndex });
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

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const chunks =
    endChunkIndex !== undefined
      ? await getReplaySnapshotChunks(websiteId, replayId, {
          endAt,
          endChunkIndex,
          endEventIndex,
        })
      : await getReplayChunks(websiteId, replayId, { endAt, endChunkIndex });
  const allEvents = mergeReplayEvents(chunks, { until, endChunkIndex, endEventIndex });
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
