import prisma from 'lib/prisma';

export async function resetWebsite(id) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { websiteId: id },
    }),
    client.eventData.deleteMany({
      where: { event: { websiteId: id } },
    }),
    client.event.deleteMany({
      where: { websiteId: id },
    }),
    client.session.deleteMany({
      where: { websiteId: id },
    }),
  ]);
}
