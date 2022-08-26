import { CLICKHOUSE, RELATIONAL } from 'lib/constants';
import { getDateQuery, parseFilters, rawQuery } from 'lib/db/relational';
import { runAnalyticsQuery } from 'lib/db/db';
import clickhouse from 'lib/clickhouse';

export async function getPageviewStats(...args) {
  return runAnalyticsQuery({
    [RELATIONAL]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
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
  const { pageviewQuery, sessionQuery, joinSession } = clickhouse.parseFilters(
    'pageview',
    null,
    filters,
    params,
    sessionKey,
  );

  return clickhouse.rawQuery(
    `
    select
      ${clickhouse.getDateStringQuery('g.t', unit)} as t, 
      g.y as y
    from
      (select 
        ${clickhouse.getDateQuery('created_at', unit, timezone)} t,
        count(${count !== '*' ? `${count}${sessionKey}` : count}) y
      from pageview
        ${joinSession}
      where pageview.website_id= $1
        and ${clickhouse.getBetweenDates('pageview.created_at', start_at, end_at)}
        ${pageviewQuery}
        ${sessionQuery}
      group by t) g
    order by t
    `,
    params,
  );
}
