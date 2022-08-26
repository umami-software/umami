import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import clickhouse from 'lib/clickhouse';
import { runAnalyticsQuery } from 'lib/db/db';
import { prisma, runQuery } from 'lib/db/relational';

export async function getSessions(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websites, start_at) {
  return runQuery(
    prisma.session.findMany({
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
      session_id,
      session_uuid,
      website_id,
      created_at,
      hostname,
      browser,
      os,
      device,
      screen,
      "language",
      country
    from session
    where website_id in (${websites.join[',']}
      and created_at >= ${clickhouse.getDateFormat(start_at)})
    `,
  );
}
