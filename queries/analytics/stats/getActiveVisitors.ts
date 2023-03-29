import { subMinutes } from 'date-fns';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getActiveVisitors(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { toUuid, rawQuery } = prisma;

  const date = subMinutes(new Date(), 5);
  const params: any = [websiteId, date];

  return rawQuery(
    `select count(distinct session_id) x
    from website_event
      join website 
        on website_event.website_id = website.website_id
    where website.website_id = $1${toUuid()}
    and website_event.created_at >= $2`,
    params,
  );
}

async function clickhouseQuery(websiteId: string) {
  const { rawQuery } = clickhouse;
  const params = { websiteId, startAt: subMinutes(new Date(), 5) };

  return rawQuery(
    `select count(distinct session_id) x
    from website_event
    where website_id = {websiteId:UUID}
    and created_at >= {startAt:DateTime('UTC')}`,
    params,
  );
}
