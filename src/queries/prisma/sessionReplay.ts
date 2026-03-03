import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';

export interface CreateReplayChunkArgs {
  websiteId: string;
  sessionId: string;
  chunkIndex: number;
  events: Uint8Array;
  eventCount: number;
  startedAt: Date;
  endedAt: Date;
}

export async function getReplayChunks(websiteId: string, sessionId: string) {
  return prisma.client.sessionReplay.findMany({
    where: {
      websiteId,
      sessionId,
    },
    orderBy: {
      chunkIndex: 'asc',
    },
    select: {
      events: true,
      chunkIndex: true,
      eventCount: true,
      startedAt: true,
      endedAt: true,
    },
  });
}

export async function createReplayChunk({
  websiteId,
  sessionId,
  chunkIndex,
  events,
  eventCount,
  startedAt,
  endedAt,
}: CreateReplayChunkArgs) {
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

export async function deleteReplaysByWebsite(websiteId: string) {
  return prisma.client.sessionReplay.deleteMany({
    where: { websiteId },
  });
}
