import { ClickHouse } from 'clickhouse';
import dateFormat from 'dateformat';
import debug from 'debug';
import { FILTER_IGNORED } from 'lib/constants';
import { CLICKHOUSE } from 'lib/db';
import { getEventDataType } from './eventData';

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

function getEventDataFilterQuery(
  filters: {
    eventKey?: string;
    eventValue?: string | number | boolean | Date;
  }[] = [],
  params: any,
) {
  const query = filters.reduce((ac, cv, i) => {
    const type = getEventDataType(cv.eventValue);

    let value = cv.eventValue;

    ac.push(`and (event_key = {eventKey${i}:String}`);

    switch (type) {
      case 'number':
        ac.push(`and event_numeric_value = {eventValue${i}:UInt64})`);
        break;
      case 'string':
        ac.push(`and event_string_value = {eventValue${i}:String})`);
        break;
      case 'boolean':
        ac.push(`and event_string_value = {eventValue${i}:String})`);
        value = cv ? 'true' : 'false';
        break;
      case 'date':
        ac.push(`and event_date_value = {eventValue${i}:DateTime('UTC')})`);
        break;
    }

    params[`eventKey${i}`] = cv.eventKey;
    params[`eventValue${i}`] = value;

    return ac;
  }, []);

  return query.join('\n');
}

function getFilterQuery(filters = {}, params = {}, field: string) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === FILTER_IGNORED) {
      return arr;
    }

    if (key === field) {
      return arr;
    }

    switch (key) {
      case 'url':
        arr.push(`and url_path = {${key}:String}`);
        params[key] = filter;
        break;
      case 'pageTitle':
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
        arr.push(`and referrer_domain= {${key}:String}`);
        params[key] = filter;
        break;

      case 'domain':
        arr.push(`and referrer_domain NOT ILIKE {${key}:String}`);
        arr.push(`and referrer_domain NOT ILIKE '/%'`);
        params[key] = `%://${filter}/%`;
        break;

      case 'query':
        arr.push(`and url_query= {${key}:String}`);
        params[key] = filter;
        break;
    }

    return arr;
  }, []);

  return query.join('\n');
}

function parseFilters(filters: any = {}, params: any = {}, field?: string) {
  const {
    domain,
    url,
    eventUrl,
    referrer,
    pageTitle,
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

  const pageviewFilters = { domain, url, referrer, query, pageTitle };
  const sessionFilters = { os, browser, device, country, subdivision1, subdivision2, city };
  const eventFilters = { url: eventUrl, eventName };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { eventName },
    filterQuery: getFilterQuery(filters, params, field),
  };
}

async function rawQuery(query, params = {}) {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', query);
    log('PARAMETERS:\n', params);
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
  getFilterQuery,
  getEventDataFilterQuery,
  parseFilters,
  findUnique,
  findFirst,
  rawQuery,
};
