import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';

export interface SaveRecordingChunkArgs {
  websiteId: string;
  sessionId: string;
  chunkIndex: number;
  events: Uint8Array;
  eventCount: number;
  startedAt: Date;
  endedAt: Date;
}

export async function saveRecordingChunk(args: SaveRecordingChunkArgs) {
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
}: SaveRecordingChunkArgs) {
  return prisma.client.sessionRecording.create({
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
