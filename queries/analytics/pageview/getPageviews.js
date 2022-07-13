import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getPageviews(websites, start_at) {
  return runQuery(
    prisma.pageview.findMany({
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
