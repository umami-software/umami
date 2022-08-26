import { prisma, runQuery } from 'lib/db/relational';

export async function deleteWebsite(website_id) {
  return runQuery(
    prisma.$transaction([
      prisma.pageview.deleteMany({
        where: { session: { website: { website_id } } },
      }),
      prisma.event_data.deleteMany({
        where: { event: { session: { website: { website_id } } } },
      }),
      prisma.event.deleteMany({
        where: { session: { website: { website_id } } },
      }),
      prisma.session.deleteMany({
        where: { website: { website_id } },
      }),
      prisma.website.delete({
        where: { website_id },
      }),
    ]),
  );
}
