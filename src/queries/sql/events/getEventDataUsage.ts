import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery, notImplemented } from '@/lib/db';
import { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataUsage';

export function getEventDataUsage(...args: [websiteIds: string[], filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: notImplemented,
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function clickhouseQuery(
  websiteIds: string[],
  filters: QueryFilters,
): Promise<{ websiteId: string; count: number }[]> {
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = filters;

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
    FUNCTION_NAME,
  );
}
