import { subMinutes } from 'date-fns';
import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { getDateFormatClickhouse, rawQuery, rawQueryClickhouse, runAnalyticsQuery } from 'lib/db';

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

  return rawQueryClickhouse(
    `
    select count(distinct session_uuid) x
    from pageview
    where website_id = $1
    and created_at >= ${getDateFormatClickhouse(subMinutes(new Date(), 5))}
    `,
    params,
  );
}
