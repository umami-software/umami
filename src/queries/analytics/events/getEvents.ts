import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { QueryFilters } from 'lib/types';

export function getEvents(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { startDate } = filters;

  return prisma.client.websiteEvent
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

function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery } = clickhouse;
  const { startDate } = filters;

  return rawQuery(
    `
    select
      event_id as id,
      website_id as websiteId, 
      session_id as sessionId,
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
      url_path as urlPath,
      referrer_domain as referrerDomain,
      event_name as eventName
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
