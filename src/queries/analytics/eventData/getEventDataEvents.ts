import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { QueryFilters, WebsiteEventData } from 'lib/types';

export async function getEventDataEvents(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { event } = filters;
  const { params } = await parseFilters(websiteId, filters);

  if (event) {
    return rawQuery(
      `
      select
        website_event.event_name as "eventName",
        event_data.event_key as "fieldName",
        event_data.data_type as "dataType",
        event_data.string_value as "fieldValue",
        count(*) as "total"
      from event_data
      inner join website_event
        on website_event.event_id = event_data.website_event_id
      where event_data.website_id = {{websiteId::uuid}}
        and event_data.created_at between {{startDate}} and {{endDate}}
        and website_event.event_name = {{event}}
      group by website_event.event_name, event_data.event_key, event_data.data_type, event_data.string_value
      order by 1 asc, 2 asc, 3 asc, 4 desc
      `,
      params,
    );
  }

  return rawQuery(
    `
    select
      website_event.event_name as "eventName",
      event_data.event_key as "fieldName",
      event_data.data_type as "dataType",
      count(*) as "total"
    from event_data
    inner join website_event
      on website_event.event_id = event_data.website_event_id
    where event_data.website_id = {{websiteId::uuid}}
      and event_data.created_at between {{startDate}} and {{endDate}}
    group by website_event.event_name, event_data.event_key, event_data.data_type
    order by 1 asc, 2 asc
    limit 500
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ eventName: string; fieldName: string; dataType: number; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { event } = filters;
  const { params } = await parseFilters(websiteId, filters);

  if (event) {
    return rawQuery(
      `
      select
        event_name as eventName,
        event_key as fieldName,
        data_type as dataType,
        string_value as fieldValue,
        count(*) as total
      from event_data
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_name = {event:String}
      group by event_key, data_type, string_value, event_name
      order by 1 asc, 2 asc, 3 asc, 4 desc
      limit 500
      `,
      params,
    ).then(a => {
      return Object.values(a).map(a => {
        return {
          eventName: a.eventName,
          fieldName: a.fieldName,
          dataType: Number(a.dataType),
          fieldValue: a.fieldValue,
          total: Number(a.total),
        };
      });
    });
  }

  return rawQuery(
    `
    select
      event_name as eventName,
      event_key as fieldName,
      data_type as dataType,
      count(*) as total
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by event_key, data_type, event_name
    order by 1 asc, 2 asc
    limit 500
    `,
    params,
  ).then(a => {
    return Object.values(a).map(a => {
      return {
        eventName: a.eventName,
        fieldName: a.fieldName,
        dataType: Number(a.dataType),
        total: Number(a.total),
      };
    });
  });
}
