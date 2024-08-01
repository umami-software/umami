import { ClickHouseClient, createClient } from '@clickhouse/client';
import dateFormat from 'dateformat';
import debug from 'debug';
import { CLICKHOUSE } from 'lib/db';
import { PageParams, QueryFilters, QueryOptions } from './types';
import { EVENT_COLUMNS, DEFAULT_PAGE_SIZE, OPERATORS } from './constants';
import { fetchWebsite } from './load';
import { maxDate } from './date';
import { filtersToArray } from './params';

export const CLICKHOUSE_DATE_FORMATS = {
  second: '%Y-%m-%dT%H:%i:%S',
  minute: '%Y-%m-%dT%H:%i:00',
  hour: '%Y-%m-%dT%H:00:00',
  day: '%Y-%m-%dT00:00:00',
  month: '%Y-%m-01T00:00:00',
  year: '%Y-01-01T00:00:00',
};

const log = debug('umami:clickhouse');

let clickhouse: ClickHouseClient;
const enabled = Boolean(process.env.CLICKHOUSE_URL);

function getClient() {
  const {
    hostname,
    port,
    pathname,
    protocol,
    username = 'default',
    password,
  } = new URL(process.env.CLICKHOUSE_URL);

  const client = createClient({
    url: `${protocol}//${hostname}:${port}`,
    database: pathname.replace('/', ''),
    username: username,
    password,
  });

  if (process.env.NODE_ENV !== 'production') {
    global[CLICKHOUSE] = client;
  }

  log('Clickhouse initialized');

  return client;
}

function getDateStringSQL(data: any, unit: string | number, timezone?: string) {
  if (timezone) {
    return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}', '${timezone}')`;
  }

  return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}')`;
}

function getDateSQL(field: string, unit: string, timezone?: string) {
  if (timezone) {
    return `date_trunc('${unit}', ${field}, '${timezone}')`;
  }
  return `date_trunc('${unit}', ${field})`;
}

function getDateFormat(date: Date) {
  return `'${dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss')}'`;
}

function mapFilter(column: string, operator: string, name: string, type: string = 'String') {
  const value = `{${name}:${type}}`;

  switch (operator) {
    case OPERATORS.equals:
      return `${column} = ${value}`;
    case OPERATORS.notEquals:
      return `${column} != ${value}`;
    case OPERATORS.contains:
      return `positionCaseInsensitive(${column}, ${value}) > 0`;
    case OPERATORS.doesNotContain:
      return `positionCaseInsensitive(${column}, ${value}) = 0`;
    default:
      return '';
  }
}

function getFilterQuery(filters: QueryFilters = {}, options: QueryOptions = {}) {
  const query = filtersToArray(filters, options).reduce((arr, { name, column, operator }) => {
    if (column) {
      arr.push(`and ${mapFilter(column, operator, name)}`);

      if (name === 'referrer') {
        arr.push('and referrer_domain != {websiteDomain:String}');
      }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function getSessionFilterQuery(filters: QueryFilters = {}, options: QueryOptions = {}) {
  const query = filtersToArray(filters, options).reduce((arr, { name, column, operator }) => {
    if (column) {
      if (EVENT_COLUMNS.includes(name)) {
        arr.push(`and has(${column}, {${name}:String})`);

        if (name === 'referrer') {
          arr.push('and not has(referrer_domain, {websiteDomain:String})');
        }
      } else {
        arr.push(`and ${mapFilter(column, operator, name)}`);
      }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function getDateQuery(filters: QueryFilters = {}) {
  const { startDate, endDate } = filters;

  if (startDate) {
    if (endDate) {
      return `and created_at between {startDate:DateTime64} and {endDate:DateTime64}`;
    } else {
      return `and created_at >= {startDate:DateTime64}`;
    }
  }

  return '';
}

function getFilterParams(filters: QueryFilters = {}) {
  return filtersToArray(filters).reduce((obj, { name, value }) => {
    if (name && value !== undefined) {
      obj[name] = value;
    }

    return obj;
  }, {});
}

async function parseFilters(websiteId: string, filters: QueryFilters = {}, options?: QueryOptions) {
  const website = await fetchWebsite(websiteId);

  return {
    filterQuery: getFilterQuery(filters, options),
    dateQuery: getDateQuery(filters),
    params: {
      ...getFilterParams(filters),
      websiteId,
      startDate: maxDate(filters.startDate, new Date(website?.resetAt)),
      websiteDomain: website.domain,
    },
  };
}

async function parseSessionFilters(
  websiteId: string,
  filters: QueryFilters = {},
  options?: QueryOptions,
) {
  const website = await fetchWebsite(websiteId);

  return {
    filterQuery: getSessionFilterQuery(filters, options),
    dateQuery: getDateQuery(filters),
    params: {
      ...getFilterParams(filters),
      websiteId,
      startDate: maxDate(filters.startDate, new Date(website?.resetAt)),
      websiteDomain: website.domain,
    },
  };
}

async function pagedQuery(
  query: string,
  queryParams: { [key: string]: any },
  pageParams: PageParams = {},
) {
  const { page = 1, pageSize, orderBy, sortDescending = false } = pageParams;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (page - 1);
  const direction = sortDescending ? 'desc' : 'asc';

  const statements = [
    orderBy && `order by ${orderBy} ${direction}`,
    +size > 0 && `limit ${+size} offset ${offset}`,
  ]
    .filter(n => n)
    .join('\n');

  const count = await rawQuery(`select count(*) as num from (${query}) t`, queryParams).then(
    res => res[0].num,
  );

  const data = await rawQuery(`${query}${statements}`, queryParams);

  return { data, count, page: +page, pageSize: size, orderBy };
}

async function rawQuery<T = unknown>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', query);
    log('PARAMETERS:\n', params);
  }

  await connect();

  const resultSet = await clickhouse.query({
    query: query,
    query_params: params,
    format: 'JSONEachRow',
  });

  return resultSet.json() as T;
}

async function insert(table: string, values: any[]) {
  await connect();

  return clickhouse.insert({ table, values, format: 'JSONEachRow' });
}

async function findUnique(data: any[]) {
  if (data.length > 1) {
    throw `${data.length} records found when expecting 1.`;
  }

  return findFirst(data);
}

async function findFirst(data: any[]) {
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
  getDateStringSQL,
  getDateSQL,
  getDateFormat,
  getFilterQuery,
  parseFilters,
  parseSessionFilters,
  pagedQuery,
  findUnique,
  findFirst,
  rawQuery,
  insert,
};
