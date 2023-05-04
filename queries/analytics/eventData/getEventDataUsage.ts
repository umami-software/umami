import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';

export function getEventDataUsage(...args: [websiteIds: string[], startDate: Date, endDate: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websiteIds: string[], startDate: Date, endDate: Date) {
  throw new Error('Not Implemented');
}

function clickhouseQuery(websiteIds: string[], startDate: Date, endDate: Date) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `select 
        website_id as websiteId,
        count(*) as count
    from event_data 
    where created_at between {startDate:DateTime64} and {endDate:DateTime64}
    and website_id in {websiteIds:Array(UUID)}
    group by website_id`,
    {
      websiteIds,
      startDate,
      endDate,
    },
  );
}
