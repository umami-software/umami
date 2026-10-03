import 'dotenv/config';
import clickhouse from '../src/lib/clickhouse';
import prisma from '../src/lib/prisma';
import { deleteClickHouseErrors } from '../src/queries/sql/errors/store';

// Schedule daily. This command only removes expired error-tracking data.
async function main() {
  let cursor: string | undefined;
  while (true) {
    const websites = await prisma.client.website.findMany({
      orderBy: { id: 'asc' },
      take: 100,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, deletedAt: true, resetAt: true, errorRetentionDays: true },
    });
    if (!websites.length) break;
    for (const website of websites) {
      const cutoff = website.deletedAt
        ? new Date()
        : new Date(
            Math.max(Date.now() - website.errorRetentionDays * 86400000, +(website.resetAt || 0)),
          );
      await prisma.client.errorEvent.deleteMany({
        where: { websiteId: website.id, receivedAt: { lt: cutoff } },
      });
      await deleteClickHouseErrors(website.id, cutoff);
      if (!clickhouse.enabled) {
        await prisma.writeRawQuery(
          `delete from error_issue i where website_id = {{websiteId::uuid}}
          and created_at < {{cutoff}} and not exists (
            select 1 from error_event e where e.website_id = i.website_id and e.issue_id = i.issue_id
          ) returning issue_id`,
          { websiteId: website.id, cutoff },
        );
      } else {
        // Bound each cross-store lookup rather than loading a site's entire history.
        let issueCursor: string | undefined;
        while (true) {
          const issues = await prisma.client.errorIssue.findMany({
            where: { websiteId: website.id, createdAt: { lt: cutoff } },
            select: { id: true },
            orderBy: { id: 'asc' },
            take: 500,
            ...(issueCursor
              ? {
                  where: {
                    websiteId: website.id,
                    createdAt: { lt: cutoff },
                    id: { gt: issueCursor },
                  },
                }
              : {}),
          });
          if (!issues.length) break;
          const retained = await clickhouse.rawQuery<Array<{ id: string }>>(
            'select distinct issue_id as id from error_event final where website_id = {websiteId:UUID} and has({ids:Array(UUID)}, issue_id)',
            { websiteId: website.id, ids: issues.map(issue => issue.id) },
          );
          const keep = new Set(retained.map(issue => issue.id));
          await prisma.client.errorIssue.deleteMany({
            where: {
              websiteId: website.id,
              id: { in: issues.filter(issue => !keep.has(issue.id)).map(issue => issue.id) },
            },
          });
          issueCursor = issues.at(-1).id;
        }
      }
    }
    cursor = websites.at(-1).id;
  }
  await prisma.client.errorRateLimit.deleteMany({
    where: { bucket: { lt: new Date(Date.now() - 86400000) } },
  });
}

main()
  .catch(() => {
    console.error('Error retention cleanup failed. Check database connectivity and migrations.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.client.$disconnect();
    if (clickhouse.enabled) await (await clickhouse.connect()).close();
  });
