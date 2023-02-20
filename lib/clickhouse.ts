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

let clickhouse: ClickHouse;
const enabled = Boolean(process.env.CLICKHOUSE_URL);

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

function getDateQuery(field, unit, timezone?) {
  if (timezone) {
    return `date_trunc('${unit}', ${field}, '${timezone}')`;
  }
  return `date_trunc('${unit}', ${field})`;
}

function getDateFormat(date) {
  return `'${dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss')}'`;
}

function getBetweenDates(field, startAt, endAt) {
  return `${field} between ${getDateFormat(startAt)} and ${getDateFormat(endAt)}`;
}

function getJsonField(column, property) {
  return `${column}.${property}`;
}

function getEventDataColumnsQuery(column, columns) {
  const query = Object.keys(columns).reduce((arr, key) => {
    const filter = columns[key];

    if (filter === undefined) {
      return arr;
    }

    arr.push(`${filter}(${getJsonField(column, key)}) as "${filter}(${key})"`);

    return arr;
  }, []);

  return query.join(',\n');
}

function getEventDataFilterQuery(column, filters) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined) {
      return arr;
    }

    arr.push(
      `${getJsonField(column, key)} = ${typeof filter === 'string' ? `'${filter}'` : filter}`,
    );

    return arr;
  }, []);

  return query.join('\nand ');
}

function getFilterQuery(filters = {}, params = {}) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === FILTER_IGNORED) {
      return arr;
    }

    switch (key) {
      case 'url':
      case 'os':
      case 'browser':
      case 'device':
      case 'subdivision1':
      case 'subdivision2':
      case 'city':
      case 'country':
        arr.push(`and ${key} = {${key}:String}`);
        params[key] = filter;
        break;

      case 'eventName':
        arr.push(`and event_name = {${key}:String}`);
        params[key] = filter;
        break;

      case 'referrer':
        arr.push(`and referrer ILIKE {${key}:String}`);
        params[key] = `%${filter}`;
        break;

      case 'domain':
        arr.push(`and referrer NOT ILIKE {${key}:String}`);
        arr.push(`and referrer NOT ILIKE '/%'`);
        params[key] = `%://${filter}/%`;
        break;

      case 'query':
        arr.push(`and url like '%?%'`);
    }

    return arr;
  }, []);

  return query.join('\n');
}

function parseFilters(filters: any = {}, params: any = {}) {
  const {
    domain,
    url,
    eventUrl,
    referrer,
    os,
    browser,
    device,
    country,
    subdivision1,
    subdivision2,
    city,
    eventName,
    query,
  } = filters;

  const pageviewFilters = { domain, url, referrer, query };
  const sessionFilters = { os, browser, device, country, subdivision1, subdivision2, city };
  const eventFilters = { url: eventUrl, eventName };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { eventName },
    filterQuery: getFilterQuery(filters, params),
  };
}

async function rawQuery(query, params = {}) {
  if (process.env.LOG_QUERY) {
    log(query);
    log(params);
  }

  await connect();

  return clickhouse.query(query, { params }).toPromise();
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

async function connect() {
  if (enabled && !clickhouse) {
    clickhouse = process.env.CLICKHOUSE_URL && (global[CLICKHOUSE] || getClient());
  }

  return clickhouse;
}

export default {
  enabled,
  client: clickhouse,
  log,
  connect,
  getDateStringQuery,
  getDateQuery,
  getDateFormat,
  getBetweenDates,
  getEventDataColumnsQuery,
  getEventDataFilterQuery,
  getFilterQuery,
  parseFilters,
  findUnique,
  findFirst,
  rawQuery,
};
