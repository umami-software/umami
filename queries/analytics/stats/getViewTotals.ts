import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getViewTotals(...args: [websites: string[], startDate: Date]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites: string[], startDate: Date) {
  return prisma.client.websiteEvent.count({
    where: {
      websiteId: {
        in: websites,
      },
      createdAt: {
        gte: startDate,
      },
    },
  });
}

async function clickhouseQuery(websiteIds: string[], startDate: Date) {
  const { rawQuery, getDateFormat, getCommaSeparatedStringFormat, findFirst } = clickhouse;

  return rawQuery(
    `
    select        
      count(*) as views
    from event
    where
      website_id in (${getCommaSeparatedStringFormat(websiteIds)})
      and created_at >= ${getDateFormat(startDate)}
     `,
  ).then(data => findFirst(data));
}
