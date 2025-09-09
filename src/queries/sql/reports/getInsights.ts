import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { BOUNCE_THRESHOLD, EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { QueryFilters } from '@/lib/types';

export async function getInsights(
  ...args: [websiteId: string, fields: { name: string; type?: string }[], filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  fields: { name: string; type?: string }[],
  filters: QueryFilters,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  const { getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { filterQuery, cohortQuery, joinSession, params } = await parseFilters(
    websiteId,
    {
      ...filters,
      eventType: EVENT_TYPE.pageView,
    },
    {
      joinSession: !!fields.find(({ name }) => SESSION_COLUMNS.includes(name)),
    },
  );

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 and t.events_count < ${BOUNCE_THRESHOLD} then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        website_event.session_id,
        website_event.visit_id,
        sum(case when website_event.event_type = ${EVENT_TYPE.pageView} then 1 else 0 end) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time",
        max((
          select count(*)
          from website_event we2
          where we2.website_id = website_event.website_id
            and we2.session_id = website_event.session_id
            and we2.created_at between {{startDate}} and {{endDate}}
            and we2.event_type = ${EVENT_TYPE.customEvent}
        )) as "events_count"
      from website_event
        ${cohortQuery}
        ${joinSession}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
      group by ${parseFieldsByName(fields)}, 
        website_event.session_id, website_event.visit_id
    ) as t
    group by ${parseFieldsByName(fields)}
    order by 1 desc, 2 desc
    limit 500
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  fields: { name: string; type?: string }[],
  filters: QueryFilters,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, cohortQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sumIf(1, t.c = 1 and ifNull(e.events_count, 0) < ${BOUNCE_THRESHOLD}) as "bounces",
      sum(max_time-min_time) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        session_id,
        visit_id,
        countIf(event_type = ${EVENT_TYPE.pageView}) as c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
      group by ${parseFieldsByName(fields)}, 
        session_id, visit_id
    ) as t
    left join (
      select session_id, toUInt32(count()) as events_count
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = ${EVENT_TYPE.customEvent}
      group by session_id
    ) as e using session_id
    group by ${parseFieldsByName(fields)}
    order by 1 desc, 2 desc
    limit 500
    `,
    params,
  );
}

function parseFields(fields: { name: any }[]) {
  return fields.map(({ name }) => `${FILTER_COLUMNS[name]} as "${name}"`).join(',');
}

function parseFieldsByName(fields: { name: any }[]) {
  return `${fields.map(({ name }) => name).join(',')}`;
}
