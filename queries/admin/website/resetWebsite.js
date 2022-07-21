import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function resetWebsite(website_id) {
  return runQuery(prisma.$queryRaw`delete from session where website_id=${website_id}`);
}
