import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { WebsiteEventMetric } from 'lib/types';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getEventMetrics(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      timezone: string;
      unit: string;
      filters: {
        url: string;
        eventName: string;
      };
    },
  ]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    filters,
  }: {
    startDate: Date;
    endDate: Date;
    timezone: string;
    unit: string;
    filters: {
      url: string;
      eventName: string;
    };
  },
) {
  const { toUuid, rawQuery, getDateQuery, getFilterQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params: any = [websiteId, resetDate, startDate, endDate];
  const filterQuery = getFilterQuery(filters, params);

  return rawQuery(
    `with event_data as (
      select d.website_event_id,
        jsonb_object_agg(
          d.event_key,
          case
            d.event_data_type
            when 1 then to_jsonb(d.event_string_value) -- string
            when 2 then to_jsonb(d.event_numeric_value) -- number
            when 3 then to_jsonb(d.event_bool_value) -- boolean
            when 4 then to_jsonb(d.event_date_value) -- date
            when 5 then d.event_string_value::jsonb -- array
          end
        ) filter (
          where d.event_key is not null
        ) as event_data
      from event_data d
      group by d.website_event_id
    )
    select
      w.event_name x,
      e.event_data d,
      ${getDateQuery('w.created_at', unit, timezone)} t,
      count(*) y
    from website_event w
      left join event_data d on w.event_id = d.website_event_id
    where website_id = $1${toUuid()}
      and created_at >= $2
      and created_at between $3 and $4
      and event_type = ${EVENT_TYPE.customEvent}
      ${filterQuery}
    group by 1, 2, 3
    order by 3`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    filters,
  }: {
    startDate: Date;
    endDate: Date;
    timezone: string;
    unit: string;
    filters: {
      url: string;
      eventName: string;
    };
  },
) {
  const { rawQuery, getDateQuery, getDateFormat, getBetweenDates, getFilterQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params = { websiteId };

  return rawQuery(
    `with event_data as (
      select d.website_event_id,
        jsonb_object_agg(
          d.event_key,
          case
            d.event_data_type
            when 1 then to_jsonb(d.event_string_value) -- string
            when 2 then to_jsonb(d.event_numeric_value) -- number
            when 3 then to_jsonb(d.event_bool_value) -- boolean
            when 4 then to_jsonb(d.event_date_value) -- date
            when 5 then d.event_string_value::jsonb -- array
          end
        ) filter (
          where d.event_key is not null
        ) as event_data
      from event_data d
      group by d.website_event_id
    )
    select
      w.event_name x,
      d.event_data d,
      ${getDateQuery('w.created_at', unit, timezone)} t,
      count(*) y
    from website_event w
      left join event_data d on w.event_id = d.website_event_id
    where website_id = {websiteId:UUID}
      and w.event_type = ${EVENT_TYPE.customEvent}
      and w.created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('w.created_at', startDate, endDate)}
      ${getFilterQuery(filters, params)}
    group by x, d, t
    order by t`,
    params,
  );
}
