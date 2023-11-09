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
  const { parseFilters, rawQuery } = prisma;
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
      ${parseFields(fields)}
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = {{eventType}}
      ${filterQuery}
    ${parseGroupBy(fields)}
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
      ${parseFields(fields)}
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    ${parseGroupBy(fields)}
    order by 1 desc, 2 desc
    limit 500
    `,
    params,
  );
}

function parseFields(fields) {
  const query = fields.reduce(
    (arr, field) => {
      const { name } = field;

      return arr.concat(`${FILTER_COLUMNS[name]} as "${name}"`);
    },
    ['count(*) as views', 'count(distinct website_event.session_id) as visitors'],
  );

  return query.join(',\n');
}

function parseGroupBy(fields) {
  if (!fields.length) {
    return '';
  }
  return `group by ${fields.map(({ name }) => FILTER_COLUMNS[name]).join(',')}`;
}
