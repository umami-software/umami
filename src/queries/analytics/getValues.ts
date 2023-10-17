import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getValues(
  ...args: [websiteId: string, column: string, startDate: Date, endDate: Date]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, column: string, startDate: Date, endDate: Date) {
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select distinct ${column} as "value"
    from website_event
    inner join session
      on session.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
    limit 100
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}

async function clickhouseQuery(websiteId: string, column: string, startDate: Date, endDate: Date) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select distinct ${column} as value
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    limit 100
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}
