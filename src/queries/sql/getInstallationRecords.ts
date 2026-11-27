import type { InstallationRecords } from '@/app/api/admin/installation/contract';
import clickhouse from '@/lib/clickhouse';
import prisma from '@/lib/prisma';

export async function getInstallationRecords(): Promise<InstallationRecords> {
  const [websiteEvents, sessions] = await Promise.all([
    process.env.CLICKHOUSE_URL
      ? clickhouse
          .rawQuery<{ count: number }[]>('select count(*) as count from website_event')
          .then(([row]) => row.count)
      : prisma.client.websiteEvent.count(),
    prisma.client.session.count(),
  ]);

  return { websiteEvents, sessions };
}
