import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { prisma, runQuery } from 'lib/relational';
import clickhouse from 'lib/clickhouse';
import { runAnalyticsQuery } from 'lib/db';

export function getEvents(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function relationalQuery(websites, start_at) {
  return runQuery(
    prisma.event.findMany({
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

function clickhouseQuery(websites, start_at) {
  return clickhouse.rawQuery(
    `
    select
      event_id,
      website_id, 
      session_id,
      created_at,
      url,
      event_name
    from event
    where website_id in (${websites.join[',']}
      and created_at >= ${clickhouse.getDateFormat(start_at)})
    `,
  );
}
