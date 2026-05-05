import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventDataEvents';

export interface WebsiteEventData {
  eventName?: string;
  propertyName: string;
  dataType: number;
  propertyValue?: string;
  total: number;
}

export async function getEventDataEvents(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { event } = filters;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (event) {
    return rawQuery(
      `
      select
        website_event.event_name as "eventName",
        event_data.data_key as "propertyName",
        event_data.data_type as "dataType",
        event_data.string_value as "propertyValue",
        count(*) as "total"
      from event_data
      inner join website_event
        on website_event.event_id = event_data.website_event_id
      ${cohortQuery}
      ${joinSessionQuery}
      where event_data.website_id = {{websiteId::uuid}}
        and event_data.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
      group by website_event.event_name, event_data.data_key, event_data.data_type, event_data.string_value
      order by 1 asc, 2 asc, 3 asc, 5 desc
      `,
      queryParams,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      website_event.event_name as "eventName",
      event_data.data_key as "propertyName",
      event_data.data_type as "dataType",
      count(*) as "total"
    from event_data
    inner join website_event
      on website_event.event_id = event_data.website_event_id
    ${cohortQuery}
    ${joinSessionQuery}
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    limit 500
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ eventName: string; propertyName: string; dataType: number; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { event } = filters;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  if (event) {
    return rawQuery(
      `
      select
        event_name as eventName,
        data_key as propertyName,
        data_type as dataType,
        string_value as propertyValue,
        count(*) as total
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
      group by data_key, data_type, string_value, event_name
      order by 1 asc, 2 asc, 3 asc, 5 desc
      limit 500
      `,
      queryParams,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    select
      event_name as eventName,
      data_key as propertyName,
      data_type as dataType,
      count(*) as total
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
    group by data_key, data_type, event_name
    order by 1 asc, 2 asc
    limit 500
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = oceanbase;
  const { event } = filters;
  const { filterQuery, cohortQuery, joinSessionQuery, buildParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  if (event) {
    return rawQuery(
      `
      SELECT
        website_event.event_name AS eventName,
        event_data.data_key AS propertyName,
        event_data.data_type AS dataType,
        event_data.string_value AS propertyValue,
        COUNT(*) AS total
      FROM event_data
      INNER JOIN website_event
        ON website_event.event_id = event_data.website_event_id
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE event_data.website_id = ?
        AND event_data.created_at BETWEEN ? AND ?
      ${filterQuery}
      GROUP BY website_event.event_name, event_data.data_key, event_data.data_type, event_data.string_value
      ORDER BY 1 ASC, 2 ASC, 3 ASC, 5 DESC
      `,
      params,
      FUNCTION_NAME,
    );
  }

  return rawQuery(
    `
    SELECT
      website_event.event_name AS eventName,
      event_data.data_key AS propertyName,
      event_data.data_type AS dataType,
      COUNT(*) AS total
    FROM event_data
    INNER JOIN website_event
      ON website_event.event_id = event_data.website_event_id
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE event_data.website_id = ?
      AND event_data.created_at BETWEEN ? AND ?
    ${filterQuery}
    LIMIT 500
    `,
    params,
    FUNCTION_NAME,
  );
}
