import { prisma, runQuery } from 'lib/db';

export async function getSessions(websites, start_at) {
  return runQuery(
    prisma.session.findMany({
      where: {
        website: {
          website_id: {
            in: websites,
          },
        },
        created_at: {
          gte: start_at,
        },
      },
    }),
  );
}
