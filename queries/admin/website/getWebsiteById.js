import { prisma, runQuery } from 'lib/relational';

export async function getWebsiteById(website_id) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        website_id,
      },
    }),
  );
}
