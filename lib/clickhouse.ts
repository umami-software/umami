import { ClickHouse } from 'clickhouse';
import dateFormat from 'dateformat';
import debug from 'debug';
import { CLICKHOUSE } from 'lib/db';
import { getDynamicDataType } from './dynamicData';
import { WebsiteMetricFilter } from './types';
import { FILTER_COLUMNS } from './constants';

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
    const type = getDynamicDataType(cv.eventValue);

    let value = cv.eventValue;

    ac.push(`and (event_key = {eventKey${i}:String}`);

    switch (type) {
      case 'number':
        ac.push(`and number_value = {eventValue${i}:UInt64})`);
        break;
      case 'string':
        ac.push(`and string_value = {eventValue${i}:String})`);
        break;
      case 'boolean':
        ac.push(`and string_value = {eventValue${i}:String})`);
        value = cv ? 'true' : 'false';
        break;
      case 'date':
        ac.push(`and date_value = {eventValue${i}:DateTime('UTC')})`);
        break;
    }

    params[`eventKey${i}`] = cv.eventKey;
    params[`eventValue${i}`] = value;

    return ac;
  }, []);

  return query.join('\n');
}

function getFilterQuery(filters = {}, params = {}) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter !== undefined) {
      const column = FILTER_COLUMNS[key] || key;
      arr.push(`and ${column} = {${key}:String}`);
      params[key] = decodeURIComponent(filter);
    }

    return arr;
  }, []);

  return query.join('\n');
}

function getFunnelQuery(urls: string[]): {
  columnsQuery: string;
  conditionQuery: string;
  urlParams: { [key: string]: string };
} {
  return urls.reduce(
    (pv, cv, i) => {
      pv.columnsQuery += `\n,url_path = {url${i}:String}${
        i > 0 && urls[i - 1] ? ` AND referrer_path = {url${i - 1}:String}` : ''
      }`;
      pv.conditionQuery += `${i > 0 ? ',' : ''} {url${i}:String}`;
      pv.urlParams[`url${i}`] = cv;

      return pv;
    },
    {
      columnsQuery: '',
      conditionQuery: '',
      urlParams: {},
    },
  );
}

function parseFilters(filters: WebsiteMetricFilter = {}, params: any = {}) {
  return {
    filterQuery: getFilterQuery(filters, params),
  };
}

async function rawQuery<T>(query, params = {}): Promise<T> {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', query);
    log('PARAMETERS:\n', params);
  }

  await connect();

  return clickhouse.query(query, { params }).toPromise() as Promise<T>;
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
  getFunnelQuery,
  getEventDataFilterQuery,
  parseFilters,
  findUnique,
  findFirst,
  rawQuery,
};
