import { subMinutes } from 'date-fns';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'getWebsiteListActiveVisitors';

export interface WebsiteListActiveVisitors {
  websiteId: string;
  visitors: number;
}

export function getWebsiteListActiveVisitors(...args: [websiteIds: string[]]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteIds: string[]) {
  const { rawQuery } = prisma;
  const startDate = subMinutes(new Date(), 5);

  return rawQuery(
    `
    select
      website_id as "websiteId",
      cast(count(distinct session_id) as bigint) as "visitors"
    from website_event
    where website_id = ANY({{websiteIds}}::uuid[])
      and created_at >= {{startDate}}
    group by website_id
    `,
    {
      websiteIds,
      startDate,
    },
    FUNCTION_NAME,
  ) as Promise<WebsiteListActiveVisitors[]>;
}

async function clickhouseQuery(websiteIds: string[]) {
  const { rawQuery } = clickhouse;
  const startDate = subMinutes(new Date(), 5);

  return rawQuery(
    `
    select
      website_id as websiteId,
      count(distinct session_id) as visitors
    from website_event
    where website_id in {websiteIds:Array(UUID)}
      and created_at >= {startDate:DateTime64}
    group by website_id
    `,
    {
      websiteIds,
      startDate,
    },
    FUNCTION_NAME,
  ) as Promise<WebsiteListActiveVisitors[]>;
}
