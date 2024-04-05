import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getValues(
  ...args: [websiteId: string, column: string, startDate: Date, endDate: Date, search: string]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  column: string,
  startDate: Date,
  endDate: Date,
  search: string,
) {
  const { rawQuery } = prisma;
  let searchQuery = '';

  if (search) {
    searchQuery = `and ${column} LIKE {{search}}`;
  }

  return rawQuery(
    `
    select ${column} as "value", count(*)
    from website_event
    inner join session
      on session.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${searchQuery}
    group by 1
    order by 2 desc
    limit 10
    `,
    {
      websiteId,
      startDate,
      endDate,
      search: `%${search}%`,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  column: string,
  startDate: Date,
  endDate: Date,
  search: string,
) {
  const { rawQuery } = clickhouse;
  let searchQuery = '';

  if (search) {
    searchQuery = `and positionCaseInsensitive(${column}, {search:String}) > 0`;
  }

  return rawQuery(
    `
    select ${column} as value, count(*)
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${searchQuery}
    group by 1
    order by 2 desc
    limit 10
    `,
    {
      websiteId,
      startDate,
      endDate,
      search,
    },
  );
}
