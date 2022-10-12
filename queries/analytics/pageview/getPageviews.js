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
        websiteUuid: {
          in: websites,
        },
      },
      createdAt: {
        gte: start_at,
      },
    },
  });
}

async function clickhouseQuery(websites, start_at) {
  const { rawQuery, getCommaSeparatedStringFormat } = clickhouse;

  return rawQuery(
    `select
        website_id,
        session_id,
        created_at,
        url
      from event
      where event_name = ''
      and ${
        websites && websites.length > 0
          ? `website_id in (${getCommaSeparatedStringFormat(websites)})`
          : '0 = 0'
      }
      and created_at >= ${clickhouse.getDateFormat(start_at)}`,
  );
}
