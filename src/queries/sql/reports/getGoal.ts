import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface GoalCriteria {
  startDate: Date;
  endDate: Date;
  type: string;
  value: string;
  operator?: string;
  property?: string;
}

export async function getGoal(...args: [websiteId: string, criteria: GoalCriteria]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, criteria: GoalCriteria) {
  const { type, value } = criteria;
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, dateQuery, params } = await parseFilters(websiteId, criteria);
  const isPage = type === 'page';
  const column = isPage ? 'url_path' : 'event_name';
  const eventType = isPage ? 1 : 2;

  return rawQuery(
    `
    select count(*) as num,
    (
      select count(${isPage ? '*' : 'distinct session_id'})
      from website_event
      where website_id = {websiteId:UUID}
      and event_type = ${eventType}
      ${dateQuery}
    ) as total
    from website_event
    where website_id = {websiteId:UUID}
    and event_type = ${eventType}
    and ${column} = {value:String}
    ${dateQuery}
    ${filterQuery}
    `,
    { ...params, value },
  );
}

async function clickhouseQuery(websiteId: string, criteria: GoalCriteria) {
  const { type, value } = criteria;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, dateQuery, params } = await parseFilters(websiteId, criteria);
  const isPage = type === 'page';
  const column = isPage ? 'url_path' : 'event_name';
  const eventType = isPage ? 1 : 2;

  return rawQuery(
    `
    select count(*) as num,
    (
      select count(${isPage ? '*' : 'distinct session_id'})
      from website_event
      where website_id = {websiteId:UUID}
      and event_type = ${eventType}
      ${dateQuery}
    ) as total
    from website_event
    where website_id = {websiteId:UUID}
    and event_type = ${eventType}
    and ${column} = {value:String}
    ${dateQuery}
    ${filterQuery}
    `,
    { ...params, value },
  ).then(results => results?.[0]);
}
