import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getPageviews(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites, start_at) {
  return prisma.client.pageview.findMany({
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

async function clickhouseQuery(websites, start_at) {
  return clickhouse.rawQuery(
    `select
        website_id,
        session_uuid,
        created_at,
        url
      from event
      where event_name = ''
      and website_id in (${websites.join[',']}
      and created_at >= ${clickhouse.getDateFormat(start_at)})`,
  );
}
