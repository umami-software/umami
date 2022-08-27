import { prisma, runQuery } from 'lib/relational';

export async function getUserWebsites(user_id) {
  return runQuery(
    prisma.website.findMany({
      where: {
        user_id,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  );
}
