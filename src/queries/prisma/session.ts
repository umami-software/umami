import prisma from '@/lib/prisma';

export async function findSession(websiteId: string, sessionId: string) {
  return prisma.client.session.findFirst({
    where: { id: sessionId, websiteId },
  });
}

export async function deleteSession(websiteId: string, sessionId: string) {
  const { transaction } = prisma;

  return transaction(
    async tx => {
      const replays = await tx.sessionReplay.findMany({
        where: { websiteId, sessionId },
        select: { visitId: true },
      });
      const visitIds = [...new Set(replays.map(r => r.visitId))];

      if (visitIds.length > 0) {
        await tx.sessionReplaySaved.deleteMany({
          where: { websiteId, visitId: { in: visitIds } },
        });
      }

      await tx.sessionReplay.deleteMany({
        where: { websiteId, sessionId },
      });

      await tx.revenue.deleteMany({
        where: { websiteId, sessionId },
      });

      const events = await tx.websiteEvent.findMany({
        where: { websiteId, sessionId },
        select: { id: true },
      });
      const eventIds = events.map(e => e.id);

      if (eventIds.length > 0) {
        await tx.eventData.deleteMany({
          where: { websiteId, websiteEventId: { in: eventIds } },
        });
      }

      await tx.websiteEvent.deleteMany({
        where: { websiteId, sessionId },
      });

      await tx.sessionData.deleteMany({
        where: { websiteId, sessionId },
      });

      return tx.session.deleteMany({
        where: { id: sessionId, websiteId },
      });
    },
    { timeout: 30000 },
  );
}
