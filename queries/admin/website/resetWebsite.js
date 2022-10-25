import prisma from 'lib/prisma';

export async function resetWebsite(websiteId) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { websiteUuid: websiteId } } },
    }),
    client.eventData.deleteMany({
      where: { event: { session: { website: { websiteUuid: websiteId } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { websiteUuid: websiteId } } },
    }),
    client.session.deleteMany({
      where: { website: { websiteUuid: websiteId } },
    }),
  ]);
}
