import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getWebsiteVisitorTotals';

interface WebsiteVisitorTotal {
  websiteId: string;
  visitors: number;
}

// Counts the same visitors as the totals from getWebsiteListCharts, without its time buckets:
// this runs over every website in a list rather than over one page of them.
export async function getWebsiteVisitorTotals(
  websiteIds: string[],
  { startDate, endDate }: { startDate: Date; endDate: Date },
): Promise<Record<string, number>> {
  if (!websiteIds.length) {
    return {};
  }

  const totals = await runQuery({
    [PRISMA]: () => relationalQuery(websiteIds, startDate, endDate),
    [CLICKHOUSE]: () => clickhouseQuery(websiteIds, startDate, endDate),
  });

  return Object.fromEntries(
    totals.map(({ websiteId, visitors }: WebsiteVisitorTotal) => [websiteId, Number(visitors)]),
  );
}

async function relationalQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<WebsiteVisitorTotal[]> {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select
      website_id as "websiteId",
      count(distinct session_id) as visitors
    from website_event
    where website_id = any({{websiteIds}}::uuid[])
      and event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})
      and created_at between {{startDate}} and {{endDate}}
    group by website_id
    `,
    { websiteIds, startDate, endDate },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<WebsiteVisitorTotal[]> {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select
      website_id as websiteId,
      uniq(session_id) as visitors
    from website_event_stats_hourly
    where website_id in {websiteIds:Array(UUID)}
      and event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by website_id
    `,
    { websiteIds, startDate, endDate },
    FUNCTION_NAME,
  );
}
