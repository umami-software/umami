import { subMinutes } from 'date-fns';
import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { rawQuery } from 'lib/db/relational';
import { runAnalyticsQuery } from 'lib/db/db';
import clickhouse from 'lib/clickhouse';

export async function getActiveVisitors(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(website_id) {
  const date = subMinutes(new Date(), 5);
  const params = [website_id, date];

  return rawQuery(
    `
    select count(distinct session_id) x
    from pageview
    where website_id = $1
    and created_at >= $2
    `,
    params,
  );
}

async function clickhouseQuery(website_id) {
  const params = [website_id];

  return clickhouse.rawQuery(
    `
    select count(distinct session_uuid) x
    from pageview
    where website_id = $1
    and created_at >= ${clickhouse.getDateFormat(subMinutes(new Date(), 5))}
    `,
    params,
  );
}
