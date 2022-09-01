import prisma from 'lib/prisma';

export async function resetWebsite(website_id) {
  const { client, transaction } = prisma;

  return transaction([
    client.pageview.deleteMany({
      where: { session: { website: { website_id } } },
    }),
    client.event_data.deleteMany({
      where: { event: { session: { website: { website_id } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { website_id } } },
    }),
    client.session.deleteMany({
      where: { website: { website_id } },
    }),
  ]);
}
