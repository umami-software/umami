import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';

export interface SaveReplayChunkArgs {
  websiteId: string;
  sessionId: string;
  chunkIndex: number;
  events: Uint8Array;
  eventCount: number;
  startedAt: Date;
  endedAt: Date;
}

export async function saveReplayChunk(args: SaveReplayChunkArgs) {
  return relationalQuery(args);
}

async function relationalQuery({
  websiteId,
  sessionId,
  chunkIndex,
  events,
  eventCount,
  startedAt,
  endedAt,
}: SaveReplayChunkArgs) {
  return prisma.client.sessionReplay.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      chunkIndex,
      events: new Uint8Array(events) as any,
      eventCount,
      startedAt,
      endedAt,
    },
  });
}
