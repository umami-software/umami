import { MYSQL, MYSQL_DATE_FORMATS, POSTGRESQL, POSTGRESQL_DATE_FORMATS } from 'lib/constants';
import prisma from 'lib/db';
import moment from 'moment-timezone';

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
    return `date_trunc('${unit}', ${field})`;
  }

  if (db === MYSQL) {
    if (timezone) {
      const tz = moment.tz(timezone).format('Z');

      return `date_format(convert_tz(${field},'+00:00','${tz}'), '${MYSQL_DATE_FORMATS[unit]}')`;
    }

    return `${field}`;
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

export function getFilterQuery(table, column, filters = {}, params = []) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const value = filters[key];

    if (!value || value === true) {
      return arr;
    }

    switch (key) {
      case 'url':
        if (table === 'pageview' || table === 'event') {
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
          arr.push(`and ${table}.referrer like $${params.length + 1} `);
          arr.push(`and ${table}.referrer not like '/%'`);
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

export function parseFilters(table, column, filters = {}, params = []) {
  const { domain, url, event_url, referrer, os, browser, device, country, event_type } = filters;

  const pageviewFilters = { domain, url, referrer };
  const sessionFilters = { os, browser, device, country };
  const eventFilters = { url: event_url, event_type };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { event_type },
    joinSession:
      os || browser || device || country
        ? `inner join session on ${table}.session_id = session.session_id`
        : '',
    pageviewQuery: getFilterQuery('pageview', column, pageviewFilters, params),
    sessionQuery: getFilterQuery('session', column, sessionFilters, params),
    eventQuery: getFilterQuery('event', column, eventFilters, params),
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
