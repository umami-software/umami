import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery, notImplemented } from '@/lib/db';

export function getEventUsage(...args: [websiteIds: string[], startDate: Date, endDate: Date]) {
  return runQuery({
    [PRISMA]: notImplemented,
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function clickhouseQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<{ websiteId: string; count: number }[]> {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select 
      website_id as websiteId,
      count(*) as count
    from website_event 
    where website_id in {websiteIds:Array(UUID)}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by website_id
    `,
    {
      websiteIds,
      startDate,
      endDate,
    },
  );
}
