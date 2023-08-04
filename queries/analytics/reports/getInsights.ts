import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { maxDate } from 'lib/date';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/load';

export interface GetInsightsCriteria {
  startDate: Date;
  endDate: Date;
  fields: { name: string; type: string; value: string }[];
  filters: string[];
  groups: string[];
}

export async function getInsights(...args: [websiteId: string, criteria: GetInsightsCriteria]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: GetInsightsCriteria,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  const { startDate, endDate, filters = [] } = criteria;
  const { parseFilters, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const params = {};
  const { filterQuery, joinSession } = parseFilters(params);

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
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.pageView,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: GetInsightsCriteria,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  const { startDate, endDate, fields = [], filters = [], groups = [] } = criteria;
  const { parseFilters, rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const params = {};
  const { filterQuery } = parseFilters(params);

  const fieldsQuery = parseFields(fields);

  return rawQuery(
    `
    select 
      ${fieldsQuery}
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by ${fields.map(({ name }) => name).join(',')}
    order by total desc
    limit 500
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.pageView,
    },
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
