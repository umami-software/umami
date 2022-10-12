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

function clickhouseQuery(websites, start_at) {
  const { rawQuery, getDateFormat, getCommaSeparatedStringFormat } = clickhouse;

  return rawQuery(
    `select
      event_id,
      website_id, 
      session_id,
      created_at,
      url,
      event_name
    from event
    where event_name != ''
      and ${
        websites && websites.length > 0
          ? `website_id in (${getCommaSeparatedStringFormat(websites)})`
          : '0 = 0'
      }
      and created_at >= ${getDateFormat(start_at)}`,
  );
}
