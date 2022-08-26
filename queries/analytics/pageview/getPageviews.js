import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { prisma, runQuery } from 'lib/relational';
import { runAnalyticsQuery } from 'lib/db/db';
import clickhouse from 'lib/clickhouse';

export async function getPageviews(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites, start_at) {
  return runQuery(
    prisma.pageview.findMany({
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
    }),
  );
}

async function clickhouseQuery(websites, start_at) {
  return clickhouse.rawQuery(
    `
      select
        view_id,
        website_id,
        session_id,
        created_at,
        url
      from pageview
      where website_id in (${websites.join[',']}
      and created_at >= ${clickhouse.getDateFormat(start_at)})
    `,
  );
}
