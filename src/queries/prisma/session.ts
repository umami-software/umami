import prisma from '@/lib/prisma';
import { deleteSessionRollups } from '@/lib/rollups';

export async function deleteSession(
  websiteId: string,
  sessionId: string,
): Promise<{ id: string } | null> {
  // Enqueue this session's rollup cleanup first: capturing the affected
  // hours reads the raw events this transaction is about to delete. The
  // serialized refresh rebuilds those hours; tier-2 rows are removed here.
  await deleteSessionRollups(websiteId, sessionId);

  const transaction = prisma.transaction as <T>(input: (tx: any) => Promise<T>) => Promise<T>;

  return transaction(async tx => {
    const session = await tx.session.findFirst({
      where: {
        id: sessionId,
        websiteId,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      return null;
    }

    const websiteEvents = await tx.websiteEvent.findMany({
      where: {
        websiteId,
        sessionId,
      },
      select: {
        id: true,
        visitId: true,
      },
    });

    const sessionReplays = await tx.sessionReplay.findMany({
      where: {
        websiteId,
        sessionId,
      },
      select: {
        visitId: true,
      },
    });

    const eventIds = websiteEvents.map(({ id }) => id);
    const visitIds = Array.from(
      new Set([...websiteEvents, ...sessionReplays].map(({ visitId }) => visitId)),
    );

    if (eventIds.length) {
      await tx.eventData.deleteMany({
        where: {
          websiteEventId: {
            in: eventIds,
          },
        },
      });
    }

    if (visitIds.length) {
      await tx.sessionReplaySaved.deleteMany({
        where: {
          websiteId,
          visitId: {
            in: visitIds,
          },
        },
      });
    }

    await tx.sessionReplay.deleteMany({
      where: {
        websiteId,
        sessionId,
      },
    });

    await tx.heatmapEvent.deleteMany({
      where: {
        websiteId,
        sessionId,
      },
    });

    await tx.revenue.deleteMany({
      where: {
        websiteId,
        sessionId,
      },
    });

    await tx.sessionData.deleteMany({
      where: {
        websiteId,
        sessionId,
      },
    });

    await tx.sessionLink.deleteMany({
      where: {
        websiteId,
        sessionId,
      },
    });

    await tx.websiteEvent.deleteMany({
      where: {
        websiteId,
        sessionId,
      },
    });

    await tx.session.delete({
      where: {
        id: sessionId,
      },
    });

    return session;
  });
}
