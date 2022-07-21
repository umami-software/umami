import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getEvents(websites, start_at) {
  return runQuery(
    prisma.event.findMany({
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
