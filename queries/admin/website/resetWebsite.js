import prisma from 'lib/prisma';

export async function resetWebsite(websiteId) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { id: websiteId } } },
    }),
    client.eventData.deleteMany({
      where: { event: { session: { website: { id: websiteId } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { id: websiteId } } },
    }),
    client.session.deleteMany({
      where: { website: { id: websiteId } },
    }),
  ]);
}
