import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from 'lib/constants';
import { QueryFilters } from 'lib/types';

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
  const { getTimestampDiffQuery, parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(
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
      sum(case when t.c = 1 then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffQuery('t.min_time', 't.max_time')}) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
        ${joinSession}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and event_type = {{eventType}}
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
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(max_time-min_time) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
        ${filterQuery}
      group by ${parseFieldsByName(fields)}, 
        session_id, visit_id
    ) as t
    group by ${parseFieldsByName(fields)}
    order by 1 desc, 2 desc
    limit 500
    `,
    params,
  ).then(a => {
    return Object.values(a).map(a => {
      return {
        ...a,
        views: Number(a.views),
        visitors: Number(a.visitors),
        visits: Number(a.visits),
        bounces: Number(a.bounces),
        totaltime: Number(a.totaltime),
      };
    });
  });
}

function parseFields(fields: { name: any }[]) {
  return fields.map(({ name }) => `${FILTER_COLUMNS[name]} as "${name}"`).join(',');
}

function parseFieldsByName(fields: { name: any }[]) {
  return `${fields.map(({ name }) => name).join(',')}`;
}
