import { prisma, runQuery } from 'lib/relational';

export async function updateWebsite(website_id, data) {
  return runQuery(
    prisma.website.update({
      where: {
        website_id,
      },
      data,
    }),
  );
}
