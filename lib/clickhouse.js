import { ClickHouse } from 'clickhouse';
import dateFormat from 'dateformat';
import debug from 'debug';
import { FILTER_IGNORED } from 'lib/constants';
import { CLICKHOUSE } from 'lib/db';

export const CLICKHOUSE_DATE_FORMATS = {
  minute: '%Y-%m-%d %H:%M:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
};

const log = debug('umami:clickhouse');

function getClient() {
  const {
    hostname,
    port,
    pathname,
    username = 'default',
    password,
  } = new URL(process.env.CLICKHOUSE_URL);

  const client = new ClickHouse({
    url: hostname,
    port: Number(port),
    format: 'json',
    config: {
      database: pathname.replace('/', ''),
    },
    basicAuth: password ? { username, password } : null,
  });

  if (process.env.NODE_ENV !== 'production') {
    global[CLICKHOUSE] = client;
  }

  log('Clickhouse initialized');

  return client;
}

function getDateStringQuery(data, unit) {
  return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}')`;
}

function getDateQuery(field, unit, timezone) {
  if (timezone) {
    return `date_trunc('${unit}', ${field}, '${timezone}')`;
  }
  return `date_trunc('${unit}', ${field})`;
}

function getDateFormat(date) {
  return `'${dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss')}'`;
}

function getBetweenDates(field, start_at, end_at) {
  return `${field} between ${getDateFormat(start_at)} 
    and ${getDateFormat(end_at)}`;
}

function getFilterQuery(table, column, filters = {}, params = []) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === FILTER_IGNORED) {
      return arr;
    }

    switch (key) {
      case 'url':
        if (table === 'pageview' || table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(filter));
        }
        break;

      case 'os':
      case 'browser':
      case 'device':
      case 'country':
        if (table === 'session') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(filter));
        }
        break;

      case 'event_name':
        if (table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(filter));
        }
        break;

      case 'referrer':
        if (table === 'pageview' || table === 'event') {
          arr.push(`and ${table}.referrer like $${params.length + 1}`);
          params.push(`%${decodeURIComponent(filter)}%`);
        }
        break;

      case 'domain':
        if (table === 'pageview') {
          arr.push(`and ${table}.referrer not like $${params.length + 1}`);
          arr.push(`and ${table}.referrer not like '/%'`);
          params.push(`%://${filter}/%`);
        }
        break;

      case 'query':
        if (table === 'pageview') {
          arr.push(`and ${table}.url like '%?%'`);
        }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function parseFilters(table, column, filters = {}, params = [], sessionKey = 'session_id') {
  const { domain, url, event_url, referrer, os, browser, device, country, event_name, query } =
    filters;

  const pageviewFilters = { domain, url, referrer, query };
  const sessionFilters = { os, browser, device, country };
  const eventFilters = { url: event_url, event_name };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { event_name },
    joinSession:
      os || browser || device || country
        ? `inner join session on ${table}.${sessionKey} = session.${sessionKey}`
        : '',
    pageviewQuery: getFilterQuery('pageview', column, pageviewFilters, params),
    sessionQuery: getFilterQuery('session', column, sessionFilters, params),
    eventQuery: getFilterQuery('event', column, eventFilters, params),
  };
}

function formatQuery(str, params = []) {
  let formattedString = str;

  params.forEach((param, i) => {
    let replace = param;

    if (typeof param === 'string' || param instanceof String) {
      replace = `'${replace}'`;
    }

    formattedString = formattedString.replace(`$${i + 1}`, replace);
  });

  return formattedString;
}

async function rawQuery(query, params = []) {
  let formattedQuery = formatQuery(query, params);

  if (process.env.LOG_QUERY) {
    log(formattedQuery);
  }

  return clickhouse.query(formattedQuery).toPromise();
}

async function findUnique(data) {
  if (data.length > 1) {
    throw `${data.length} records found when expecting 1.`;
  }

  return data[0] ?? null;
}

async function findFirst(data) {
  return data[0] ?? null;
}

// Initialization
const clickhouse = process.env.CLICKHOUSE_URL && (global[CLICKHOUSE] || getClient());

export default {
  client: clickhouse,
  log,
  getDateStringQuery,
  getDateQuery,
  getDateFormat,
  getBetweenDates,
  getFilterQuery,
  parseFilters,
  findUnique,
  findFirst,
  rawQuery,
};
