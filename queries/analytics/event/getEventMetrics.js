import {
  getDateQuery,
  getDateStringQuery,
  getFilterQuery,
  rawQuery,
  runAnalyticsQuery,
  clickhouse,
} from 'lib/db';

export function getEventMetrics(...args) {
  return runAnalyticsQuery(relationalQuery(...args), clickhouseQuery(...args));
}

function relationalQuery(
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
      ${getDateStringQuery(getDateQuery('created_at', unit, timezone), unit)} t,
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

function clickhouseQuery(
  website_id,
  start_at,
  end_at,
  timezone = 'utc',
  unit = 'day',
  filters = {},
) {
  const params = [website_id, start_at, end_at];

  return clickhouse.query(
    `
    select
      event_value x,
      ${getDateStringQuery(getDateQuery('created_at', unit, timezone), unit)} t,
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
