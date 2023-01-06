import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getPageviews(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites, startAt) {
  return prisma.client.pageview.findMany({
    where: {
      websiteId: {
        in: websites,
      },
      createdAt: {
        gte: startAt,
      },
    },
  });
}

async function clickhouseQuery(websites, startAt) {
  const { rawQuery, getCommaSeparatedStringFormat } = clickhouse;

  return rawQuery(
    `select
        website_id,
        session_id,
        created_at,
        url
      from event
      where event_type = 1
        and ${
          websites && websites.length > 0
            ? `website_id in (${getCommaSeparatedStringFormat(websites)})`
            : '0 = 0'
        }
      and created_at >= ${clickhouse.getDateFormat(startAt)}`,
  );
}
