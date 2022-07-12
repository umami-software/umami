import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getWebsiteByShareId(share_id) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        share_id,
      },
    }),
  );
}
