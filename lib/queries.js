import moment from 'moment-timezone';
import prisma from 'lib/db';
import { subMinutes } from 'date-fns';
import {
  MYSQL,
  POSTGRESQL,
  MYSQL_DATE_FORMATS,
  POSTGRESQL_DATE_FORMATS,
  URL_LENGTH,
} from 'lib/constants';

export function getDatabase() {
  const type =
    process.env.DATABASE_TYPE ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.split(':')[0]);

  if (type === 'postgres') {
    return 'postgresql';
  }

  return type;
}

export function getDateQuery(field, unit, timezone) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    if (timezone) {
      return `to_char(date_trunc('${unit}', ${field} at time zone '${timezone}'), '${POSTGRESQL_DATE_FORMATS[unit]}')`;
    }
    return `to_char(date_trunc('${unit}', ${field}), '${POSTGRESQL_DATE_FORMATS[unit]}')`;
  }

  if (db === MYSQL) {
    if (timezone) {
      const tz = moment.tz(timezone).format('Z');

      return `DATE_FORMAT(convert_tz(${field},'+00:00','${tz}'), '${MYSQL_DATE_FORMATS[unit]}')`;
    }

    return `DATE_FORMAT(${field}, '${MYSQL_DATE_FORMATS[unit]}')`;
  }
}

export function getTimestampInterval(field) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    return `floor(extract(epoch from max(${field}) - min(${field})))`;
  }

  if (db === MYSQL) {
    return `floor(unix_timestamp(max(${field})) - unix_timestamp(min(${field})))`;
  }
}

export function getFilterQuery(table, filters = {}, params = []) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const value = filters[key];

    if (value === undefined) {
      return arr;
    }

    switch (key) {
      case 'url':
        if (table === 'session' || table === 'pageview') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(value));
        }
        break;

      case 'os':
      case 'browser':
      case 'device':
      case 'country':
        if (table === 'session') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(value));
        }
        break;

      case 'event_type':
        if (table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(value));
        }
        break;

      case 'referrer':
        if (table === 'pageview') {
          arr.push(`and ${table}.referrer like $${params.length + 1}`);
          params.push(`%${decodeURIComponent(value)}%`);
        }
        break;

      case 'domain':
        if (table === 'pageview') {
          arr.push(`and ${table}.referrer not like $${params.length + 1}`);
          arr.push(`and ${table}.referrer not like '/%'`);
          params.push(`%://${value}/%`);
        }
        break;
    }

    return arr;
  }, []);

  return query.join('\n');
}

export function parseFilters(table, filters = {}, params = []) {
  const { domain, url, referrer, os, browser, device, country, event_type } = filters;

  const pageviewFilters = { domain, url, referrer };
  const sessionFilters = { os, browser, device, country };
  const eventFilters = { event_type };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { event_type },
    joinSession:
      os || browser || device || country
        ? `inner join session on ${table}.session_id = session.session_id`
        : '',
    pageviewQuery: getFilterQuery('pageview', pageviewFilters, params),
    sessionQuery: getFilterQuery('session', sessionFilters, params),
    eventQuery: getFilterQuery('event', eventFilters, params),
  };
}

export async function runQuery(query) {
  return query.catch(e => {
    throw e;
  });
}

export async function rawQuery(query, params = []) {
  const db = getDatabase();

  if (db !== POSTGRESQL && db !== MYSQL) {
    return Promise.reject(new Error('Unknown database.'));
  }

  const sql = db === MYSQL ? query.replace(/\$[0-9]+/g, '?') : query;

  return runQuery(prisma.$queryRawUnsafe.apply(prisma, [sql, ...params]));
}

export async function getWebsiteById(website_id) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        website_id,
      },
    }),
  );
}

export async function getWebsiteByUuid(website_uuid) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        website_uuid,
      },
    }),
  );
}

export async function getWebsiteByShareId(share_id) {
  return runQuery(
    prisma.website.findUnique({
      where: {
        share_id,
      },
    }),
  );
}

export async function getUserWebsites(user_id) {
  return runQuery(
    prisma.website.findMany({
      where: {
        user_id,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  );
}

export async function getAllWebsites() {
  let data = await runQuery(
    prisma.website.findMany({
      orderBy: [
        {
          user_id: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      include: {
        account: {
          select: {
            username: true,
          },
        },
      },
    }),
  );
  return data.map(i => ({ ...i, account: i.account.username }));
}

export async function createWebsite(user_id, data) {
  return runQuery(
    prisma.website.create({
      data: {
        account: {
          connect: {
            user_id,
          },
        },
        ...data,
      },
    }),
  );
}

export async function updateWebsite(website_id, data) {
  return runQuery(
    prisma.website.update({
      where: {
        website_id,
      },
      data,
    }),
  );
}

export async function resetWebsite(website_id) {
  return runQuery(prisma.$queryRaw`delete from session where website_id=${website_id}`);
}

export async function deleteWebsite(website_id) {
  return runQuery(
    prisma.website.delete({
      where: {
        website_id,
      },
    }),
  );
}

export async function createSession(website_id, data) {
  return runQuery(
    prisma.session.create({
      data: {
        website_id,
        ...data,
      },
      select: {
        session_id: true,
      },
    }),
  );
}

export async function getSessionByUuid(session_uuid) {
  return runQuery(
    prisma.session.findUnique({
      where: {
        session_uuid,
      },
    }),
  );
}

export async function savePageView(website_id, session_id, url, referrer) {
  return runQuery(
    prisma.pageview.create({
      data: {
        website_id,
        session_id,
        url: url?.substr(0, URL_LENGTH),
        referrer: referrer?.substr(0, URL_LENGTH),
      },
    }),
  );
}

export async function saveEvent(website_id, session_id, url, event_type, event_value) {
  return runQuery(
    prisma.event.create({
      data: {
        website_id,
        session_id,
        url: url?.substr(0, URL_LENGTH),
        event_type: event_type?.substr(0, 50),
        event_value: event_value?.substr(0, 50),
      },
    }),
  );
}

export async function getAccounts() {
  return runQuery(
    prisma.account.findMany({
      orderBy: [
        { is_admin: 'desc' },
        {
          username: 'asc',
        },
      ],
    }),
  );
}

export async function getAccountById(user_id) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        user_id,
      },
    }),
  );
}

export async function getAccountByUsername(username) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        username,
      },
    }),
  );
}

export async function updateAccount(user_id, data) {
  return runQuery(
    prisma.account.update({
      where: {
        user_id,
      },
      data,
    }),
  );
}

export async function deleteAccount(user_id) {
  return runQuery(
    prisma.account.delete({
      where: {
        user_id,
      },
    }),
  );
}

export async function createAccount(data) {
  return runQuery(
    prisma.account.create({
      data,
    }),
  );
}

export async function getSessions(websites, start_at) {
  return runQuery(
    prisma.session.findMany({
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

export async function getPageviews(websites, start_at) {
  return runQuery(
    prisma.pageview.findMany({
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

export async function getEvents(websites, start_at) {
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

export function getWebsiteStats(website_id, start_at, end_at, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters('pageview', filters, params);

  return rawQuery(
    `
      select sum(t.c) as "pageviews",
        count(distinct t.session_id) as "uniques",
        sum(case when t.c = 1 then 1 else 0 end) as "bounces",
        sum(t.time) as "totaltime"
      from (
         select pageview.session_id,
           ${getDateQuery('pageview.created_at', 'hour')},
           count(*) c,
           ${getTimestampInterval('pageview.created_at')} as "time"
         from pageview
           ${joinSession}
         where pageview.website_id=$1
         and pageview.created_at between $2 and $3
         ${pageviewQuery}
         ${sessionQuery}
         group by 1, 2
     ) t
    `,
    params,
  );
}

export function getPageviewStats(
  website_id,
  start_at,
  end_at,
  timezone = 'utc',
  unit = 'day',
  count = '*',
  filters = {},
) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters('pageview', filters, params);

  return rawQuery(
    `
    select ${getDateQuery('pageview.created_at', unit, timezone)} t,
      count(${count}) y
    from pageview
      ${joinSession}
    where pageview.website_id=$1
    and pageview.created_at between $2 and $3
    ${pageviewQuery}
    ${sessionQuery}
    group by 1
    order by 1
    `,
    params,
  );
}

export function getSessionMetrics(website_id, start_at, end_at, field, filters = {}) {
  const params = [website_id, start_at, end_at];
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters('pageview', filters, params);

  return rawQuery(
    `
    select ${field} x, count(*) y
    from session as x
    where x.session_id in (
      select pageview.session_id
      from pageview
        ${joinSession}
      where pageview.website_id=$1
      and pageview.created_at between $2 and $3
      ${pageviewQuery}
      ${sessionQuery}
    )
    group by 1
    order by 2 desc
    `,
    params,
  );
}

export function getPageviewMetrics(website_id, start_at, end_at, field, table, filters = {}) {
  const params = [website_id, start_at, end_at];
  console.log({ table, filters });
  const { pageviewQuery, sessionQuery, joinSession } = parseFilters(table, filters, params);

  return rawQuery(
    `
    select ${field} x, count(*) y
    from ${table}
      ${joinSession}
    where ${table}.website_id=$1
    and ${table}.created_at between $2 and $3
    ${pageviewQuery}
    ${joinSession && sessionQuery}
    group by 1
    order by 2 desc
    `,
    params,
  );
}

export function getActiveVisitors(website_id) {
  const date = subMinutes(new Date(), 5);
  const params = [website_id, date];

  return rawQuery(
    `
    select count(distinct session_id) x
    from pageview
    where website_id=$1
    and created_at >= $2
    `,
    params,
  );
}

export function getEventMetrics(
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

export async function getRealtimeData(websites, time) {
  const [pageviews, sessions, events] = await Promise.all([
    getPageviews(websites, time),
    getSessions(websites, time),
    getEvents(websites, time),
  ]);

  return {
    pageviews: pageviews.map(({ view_id, ...props }) => ({
      __id: `p${view_id}`,
      view_id,
      ...props,
    })),
    sessions: sessions.map(({ session_id, ...props }) => ({
      __id: `s${session_id}`,
      session_id,
      ...props,
    })),
    events: events.map(({ event_id, ...props }) => ({
      __id: `e${event_id}`,
      event_id,
      ...props,
    })),
    timestamp: Date.now(),
  };
}
