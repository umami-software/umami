import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';

export async function getSessions(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites, start_at) {
  return prisma.client.session.findMany({
    where: {
      ...(websites && websites.length > 0
        ? {
            website: {
              website_id: {
                in: websites,
              },
            },
          }
        : {}),
      created_at: {
        gte: start_at,
      },
    },
  });
}

async function clickhouseQuery(websites, start_at) {
  const { rawQuery, getDateFormat } = clickhouse;

  return rawQuery(
    `select distinct
      session_uuid,
      website_id,
      created_at,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country
    from event
    where ${websites && websites.length > 0 ? `website_id in (${websites.join(',')})` : '0 = 0'}
      and created_at >= ${getDateFormat(start_at)}`,
  );
}
