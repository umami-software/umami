import { prisma, runQuery } from 'lib/db';

export async function deleteWebsite(website_id) {
  return runQuery(
    prisma.website.delete({
      where: {
        website_id,
      },
    }),
  );
}
