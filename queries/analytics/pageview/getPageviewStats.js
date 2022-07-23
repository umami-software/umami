import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import {
  getBetweenDatesClickhouse,
  getDateQuery,
  getDateQueryClickhouse,
  getDateStringQueryClickhouse,
  parseFilters,
  rawQuery,
  rawQueryClickhouse,
  runAnalyticsQuery,
} from 'lib/db';

export async function getPageviewStats(...args) {
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
  count = '*',
  filters = {},
  sessionKey = 'session_id',
) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
  );

  return rawQuery(
    `
      select ${getDateQuery('pageview.created_at', unit, timezone)} t,
        count(${count !== '*' ? `${count}${sessionKey}` : count}) y
      from pageview
        ${joinSession}
      where pageview.website_id=$1
        and pageview.created_at between $2 and $3
        ${pageviewQuery}
        ${sessionQuery}
      group by 1
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
  count = '*',
  filters = {},
  sessionKey = 'session_uuid',
) {
  const params = [website_id];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(
    'pageview',
    null,
    filters,
    params,
    sessionKey,
  );

  return rawQueryClickhouse(
    `
    select
      ${getDateStringQueryClickhouse('g.t', unit)} as t, 
      g.y as y
    from
      (select 
        ${getDateQueryClickhouse('created_at', unit, timezone)} t,
        count(${count !== '*' ? `${count}${sessionKey}` : count}) y
      from pageview
        ${joinSession}
      where pageview.website_id= $1
        and ${getBetweenDatesClickhouse('pageview.created_at', start_at, end_at)}
        ${pageviewQuery}
        ${sessionQuery}
      group by t) g
    order by t
    `,
    params,
  );
}
