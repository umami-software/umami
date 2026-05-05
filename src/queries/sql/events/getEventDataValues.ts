import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataValues';

interface WebsiteEventData {
  value: string;
  total: number;
}

export async function getEventDataValues(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string }]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
) {
  const { rawQuery, parseFilters, getDateSQL } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    select
      case
        when data_type = 2 then replace(string_value, '.0000', '')
        when data_type = 4 then ${getDateSQL('date_value', 'hour')}
        else string_value
      end as "value",
      count(distinct event_data.event_id) as "total"
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    join event_data
        on event_data.event_id = website_event.event_id
          and event_data.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_data.data_key = {{propertyName}}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<WebsiteEventData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  return rawQuery(
    `
    select
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      uniq(event_data.event_id) as "total"
    from website_event
    ${cohortQuery}
    join event_data final
      on event_data.event_id = website_event.event_id
        and event_data.website_id = {websiteId:UUID}
    where website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_data.data_key = {propertyName:String}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<WebsiteEventData[]> {
  const { rawQuery, parseFilters, getDateSQL } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, buildParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const params = buildParams([websiteId, filters.startDate, filters.endDate, filters.propertyName]);

  return rawQuery(
    `
    SELECT
      CASE
        WHEN data_type = 2 THEN REPLACE(string_value, '.0000', '')
        WHEN data_type = 4 THEN ${getDateSQL('date_value', 'hour')}
        ELSE string_value
      END AS value,
      COUNT(DISTINCT event_data.event_id) AS total
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    JOIN event_data
        ON event_data.event_id = website_event.event_id
          AND event_data.website_id = website_event.website_id
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      AND event_data.data_key = ?
    ${filterQuery}
    GROUP BY value
    ORDER BY 2 DESC
    LIMIT 100
    `,
    params,
    FUNCTION_NAME,
  );
}
