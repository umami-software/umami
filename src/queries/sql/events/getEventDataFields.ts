import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataFields';

export async function getEventDataFields(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters, getDateSQL } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      data_key as "propertyName",
      data_type as "dataType",
      case 
        when data_type = 2 then replace(string_value, '.0000', '') 
        when data_type = 4 then ${getDateSQL('date_value', 'hour')} 
        else string_value
      end as "value",
      count(*) as "total"
    from event_data
    join website_event on website_event.event_id = event_data.website_event_id
      and website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by data_key, data_type, value
    order by 2 desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ propertyName: string; dataType: number; propertyValue: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  return rawQuery(
    `
    select
      data_key as propertyName,
      data_type as dataType,
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      count(*) as "total"
    from event_data
    any left join (
          select *
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and event_type = 2) website_event
    on website_event.event_id = event_data.event_id
      and website_event.session_id = event_data.session_id
      and website_event.website_id = event_data.website_id
    ${cohortQuery}
    where event_data.website_id = {websiteId:UUID}
      and event_data.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${filterQuery}
    group by data_key, data_type, value
    order by 2 desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters, getDateSQL } = oceanbase;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    SELECT
      data_key AS propertyName,
      data_type AS dataType,
      CASE
        WHEN data_type = 2 THEN REPLACE(string_value, '.0000', '')
        WHEN data_type = 4 THEN ${getDateSQL('date_value', 'hour')}
        ELSE string_value
      END AS value,
      COUNT(*) AS total
    FROM event_data
    JOIN website_event ON website_event.event_id = event_data.website_event_id
      AND website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE event_data.website_id = ?
      AND event_data.created_at BETWEEN ? AND ?
    ${filterQuery}
    GROUP BY data_key, data_type, value
    ORDER BY 2 DESC
    LIMIT 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}
