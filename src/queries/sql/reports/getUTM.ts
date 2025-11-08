import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface UTMParameters {
  column: string;
  startDate: Date;
  endDate: Date;
}

export async function getUTM(
  ...args: [websiteId: string, parameters: UTMParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: UTMParameters,
  filters: QueryFilters,
) {
  const { column, startDate, endDate } = parameters;
  const { parseFilters, rawQuery } = prisma;

  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select website_event.${column} utm, count(*) as views
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and coalesce(website_event.${column}, '') != ''
      ${filterQuery}
    group by 1
    order by 2 desc
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: UTMParameters,
  filters: QueryFilters,
) {
  const { column, startDate, endDate } = parameters;
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select ${column} utm, count(*) as views
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and ${column} != ''
      ${filterQuery}
    group by 1
    order by 2 desc
    `,
    queryParams,
  );
}
