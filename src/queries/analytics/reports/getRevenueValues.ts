import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA, getDatabaseType, POSTGRESQL } from 'lib/db';

export async function getRevenueValues(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
  },
) {
  const { rawQuery } = prisma;
  const { startDate, endDate } = criteria;

  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';

  return rawQuery(
    `
    select distinct string_value as currency
    from event_data
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and data_key ${like} '%currency%'
    order by currency   
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
  },
) {
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = criteria;

  return rawQuery(
    `
    select distinct string_value as currency
    from event_data
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and positionCaseInsensitive(data_key, 'currency') > 0
    order by currency      
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  );
}
