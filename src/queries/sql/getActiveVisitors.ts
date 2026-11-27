import { subMinutes } from 'date-fns';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { ActiveVisitors, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getActiveVisitors';

export async function getActiveVisitors(
  ...args: [websiteId: string, filters?: QueryFilters]
): Promise<ActiveVisitors | null> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters?: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const startDate = subMinutes(new Date(), 5);
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = filters
    ? parseFilters({ ...filters, websiteId, startDate })
    : {
        filterQuery: '',
        joinSessionQuery: '',
        cohortQuery: '',
        queryParams: { websiteId, startDate },
      };

  const result = await rawQuery(
    `
    select count(distinct website_event.session_id) as "visitors"
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
    and website_event.created_at >= {{startDate}}
    ${filterQuery}
    `,
    queryParams,
    FUNCTION_NAME,
  );

  return result?.[0] ?? null;
}

async function clickhouseQuery(
  websiteId: string,
  filters?: QueryFilters,
): Promise<ActiveVisitors | null> {
  const { rawQuery, parseFilters } = clickhouse;
  const startDate = subMinutes(new Date(), 5);
  const { filterQuery, cohortQuery, queryParams } = filters
    ? parseFilters({ ...filters, websiteId, startDate })
    : {
        filterQuery: '',
        cohortQuery: '',
        queryParams: { websiteId, startDate },
      };

  const result = await rawQuery(
    `
    select
      count(distinct session_id) as "visitors"
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
      ${filterQuery}
    `,
    queryParams,
    FUNCTION_NAME,
  );

  return result[0] ?? null;
}
