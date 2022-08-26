import { prisma, runQuery } from 'lib/db/relational';

export async function deleteAccount(user_id) {
  return runQuery(
    prisma.$transaction([
      prisma.pageview.deleteMany({
        where: { session: { website: { user_id } } },
      }),
      prisma.event_data.deleteMany({
        where: { event: { session: { website: { user_id } } } },
      }),
      prisma.event.deleteMany({
        where: { session: { website: { user_id } } },
      }),
      prisma.session.deleteMany({
        where: { website: { user_id } },
      }),
      prisma.website.deleteMany({
        where: { user_id },
      }),
      prisma.account.delete({
        where: {
          user_id,
        },
      }),
    ]),
  );
}
