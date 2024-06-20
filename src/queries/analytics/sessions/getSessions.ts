import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';
import { QueryFilters } from 'lib/types';

export async function getSessions(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { startDate } = filters;

  return prisma.client.session
    .findMany({
      where: {
        websiteId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    .then(a => {
      return Object.values(a).map(a => {
        return {
          ...a,
          timestamp: new Date(a.createdAt).getTime() / 1000,
        };
      });
    });
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery } = clickhouse;
  const { startDate } = filters;

  return rawQuery(
    `
    select
      session_id as id,
      website_id as websiteId,
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      subdivision2,
      city
    from website_event
    where website_id = {websiteId:UUID}
    and created_at >= {startDate:DateTime64}
    order by created_at desc
    `,
    {
      websiteId,
      startDate,
    },
  );
}
