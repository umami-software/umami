import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataProperties';

export async function getSessionDataProperties(
  ...args: [websiteId: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
        data_key as "propertyName",
        count(distinct session_data.session_id) as "total"
    from website_event 
    ${cohortQuery}
    ${joinSessionQuery}
    join session_data 
        on session_data.session_id = website_event.session_id
          and session_data.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
    group by 1
    order by 2 desc
    limit 500
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ propertyName: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  return rawQuery(
    `
    select
      data_key as propertyName,
      count(distinct session_data.session_id) as total
    from website_event
    ${cohortQuery}
    join session_data final
      on session_data.session_id = website_event.session_id
        and session_data.website_id = {websiteId:UUID}
    where website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and session_data.data_key != ''
    ${filterQuery}
    group by 1
    order by 2 desc
    limit 500
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, buildParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT
      data_key AS propertyName,
      COUNT(DISTINCT session_data.session_id) AS total
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    JOIN session_data
      ON session_data.session_id = website_event.session_id
        AND session_data.website_id = website_event.website_id
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 500
    `,
    params,
    FUNCTION_NAME,
  );
}
