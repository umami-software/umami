import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import {
  getBetweenDatesClickhouse,
  getDateQuery,
  getDateQueryClickhouse,
  getFilterQuery,
  rawQuery,
  rawQueryClickhouse,
  runAnalyticsQuery,
} from 'lib/db';

export async function getEventMetrics(...args) {
  return runAnalyticsQuery({
    [`${RELATIONAL}`]: () => relationalQuery(...args),
    [`${CLICKHOUSE}`]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  website_id,
  start_at,
  end_at,
  timezone = 'utc',
  unit = 'day',
  filters = {},
) {
  const params = [website_id, start_at, end_at];

  return rawQuery(
    `
    select
      event_value x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from event
    where website_id=$1
    and created_at between $2 and $3
    ${getFilterQuery('event', filters, params)}
    group by 1, 2
    order by 2
    `,
    params,
  );
}

async function clickhouseQuery(
  website_id,
  start_at,
  end_at,
  timezone = 'UTC',
  unit = 'day',
  filters = {},
) {
  const params = [website_id];

  return rawQueryClickhouse(
    `
    select
      event_value x,
      ${getDateQueryClickhouse('created_at', unit, timezone)} t,
      count(*) y
    from event
    where website_id= $1
      and ${getBetweenDatesClickhouse('created_at', start_at, end_at)}
      ${getFilterQuery('event', filters, params)}
    group by x, t
    order by t
    `,
    params,
  );
}
