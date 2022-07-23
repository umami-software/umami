import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import {
  getDateFormatClickhouse,
  prisma,
  rawQueryClickhouse,
  runAnalyticsQuery,
  runQuery,
} from 'lib/db';

export async function getSessions(...args) {
  return runAnalyticsQuery({
    [`${RELATIONAL}`]: () => relationalQuery(...args),
    [`${CLICKHOUSE}`]: () => clickhouseQuery(...args),
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
  return rawQueryClickhouse(
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
      and created_at >= ${getDateFormatClickhouse(start_at)})
    `,
  );
}
