import { prisma, runQuery } from 'lib/db/relational';

export async function getWebsiteByUuid(website_uuid) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        website_uuid,
      },
    }),
  );
}
