import { subMinutes } from 'date-fns';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getActiveVisitors(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId) {
  const date = subMinutes(new Date(), 5);
  const params = [websiteId, date];

  return prisma.rawQuery(
    `select count(distinct session_id) x
    from pageview
    where website_id = $1
    and created_at >= $2`,
    params,
  );
}

async function clickhouseQuery(websiteId) {
  const { rawQuery, getDateFormat } = clickhouse;
  const params = [websiteId];

  return rawQuery(
    `select count(distinct session_uuid) x
    from event
    where website_id = $1
    and created_at >= ${getDateFormat(subMinutes(new Date(), 5))}`,
    params,
  );
}
