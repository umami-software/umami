import prisma from '@/lib/prisma';

export async function deleteRecordingsByWebsite(websiteId: string) {
  return relationalQuery(websiteId);
}

async function relationalQuery(websiteId: string) {
  return prisma.client.sessionRecording.deleteMany({
    where: { websiteId },
  });
}
