import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface UTMParameters {
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
  const { startDate, endDate } = parameters;
  const { parseFilters, rawQuery } = prisma;

  const { filterQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and coalesce(url_query, '') != ''
      and event_type = 1
      ${filterQuery}
    group by 1
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: UTMParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate } = parameters;
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and url_query != ''
      and event_type = 1
      ${filterQuery}
    group by 1
    `,
    queryParams,
  );
}
