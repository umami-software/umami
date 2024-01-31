import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery, notImplemented } from 'lib/db';

export function getEventDataUsage(...args: [websiteIds: string[], startDate: Date, endDate: Date]) {
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
    from event_data 
    where created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and website_id in {websiteIds:Array(UUID)}
    group by website_id
    `,
    {
      websiteIds,
      startDate,
      endDate,
    },
  ).then(a => {
    return Object.values(a).map(a => {
      return { websiteId: a.websiteId, count: Number(a.count) };
    });
  });
}
