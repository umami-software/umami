import prisma from '@/lib/prisma';

export async function deleteReplaysByWebsite(websiteId: string) {
  return relationalQuery(websiteId);
}

async function relationalQuery(websiteId: string) {
  return prisma.client.sessionReplay.deleteMany({
    where: { websiteId },
  });
}
