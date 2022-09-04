import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export function getEvents(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websites, start_at) {
  return prisma.client.event.findMany({
    where: {
      website: {
        website_id: {
          in: websites,
        },
      },
      created_at: {
        gte: start_at,
      },
    },
  });
}

function clickhouseQuery(websites, start_at) {
  const { rawQuery, getDateFormat } = clickhouse;

  return rawQuery(
    `select
      event_id,
      website_id, 
      session_id,
      created_at,
      url,
      event_name
    from event
    where website_id in (${websites.join[',']}
      and created_at >= ${getDateFormat(start_at)})`,
  );
}
