import prisma from '@/lib/prisma';

export async function getRecordingChunks(websiteId: string, sessionId: string) {
  return relationalQuery(websiteId, sessionId);
}

async function relationalQuery(websiteId: string, sessionId: string) {
  return prisma.client.sessionRecording.findMany({
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
