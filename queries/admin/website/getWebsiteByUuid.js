import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getWebsiteByUuid(website_uuid) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        website_uuid,
      },
    }),
  );
}
