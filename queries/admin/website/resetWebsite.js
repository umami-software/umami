import { prisma, runQuery } from 'lib/db/relational';

export async function resetWebsite(website_id) {
  return runQuery(prisma.$queryRaw`delete from session where website_id=${website_id}`);
}
