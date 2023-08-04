import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { EVENT_TYPE } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getInsights(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      url_path,
      count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = {{eventType}}
      ${filterQuery}
    group by 1
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  const { parseFilters, rawQuery } = clickhouse;
  const { fields } = filters;
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
      and created_at between {startDate:DateTime} and {endDate:DateTime}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by ${fields.map(({ name }) => name).join(',')}
    order by total desc
    limit 500
    `,
    params,
  );
}

function parseFields(fields) {
  let count = false;
  let distinct = false;

  const query = fields.reduce((arr, field) => {
    const { name, value } = field;

    if (!count && value === 'total') {
      count = true;
      arr = arr.concat(`count(*) as views`);
    } else if (!distinct && value === 'unique') {
      distinct = true;
      //arr = arr.concat(`count(distinct ${name})`);
    }

    return arr.concat(name);
  }, []);

  return query.join(',\n');
}
