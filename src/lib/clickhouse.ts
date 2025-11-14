import { ClickHouseClient, createClient } from '@clickhouse/client';
import { formatInTimeZone } from 'date-fns-tz';
import debug from 'debug';
import { CLICKHOUSE } from '@/lib/db';
import { DEFAULT_PAGE_SIZE, FILTER_COLUMNS, OPERATORS } from './constants';
import { filtersObjectToArray } from './params';
import { QueryFilters, QueryOptions } from './types';

export const CLICKHOUSE_DATE_FORMATS = {
  utc: '%Y-%m-%dT%H:%i:%SZ',
  second: '%Y-%m-%d %H:%i:%S',
  minute: '%Y-%m-%d %H:%i:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
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
    globalThis[CLICKHOUSE] = client;
  }

  log('Clickhouse initialized');

  return client;
}

function getUTCString(date?: Date | string | number) {
  return formatInTimeZone(date || new Date(), 'UTC', 'yyyy-MM-dd HH:mm:ss');
}

function getDateStringSQL(data: any, unit: string = 'utc', timezone?: string) {
  if (timezone) {
    return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}', '${timezone}')`;
  }

  return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}')`;
}

function getDateSQL(field: string, unit: string, timezone?: string) {
  if (timezone) {
    return `toDateTime(date_trunc('${unit}', ${field}, '${timezone}'))`;
  }
  return `toDateTime(date_trunc('${unit}', ${field}))`;
}

function getSearchSQL(column: string, param: string = 'search'): string {
  return `and positionCaseInsensitive(${column}, {${param}:String}) > 0`;
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

function getFilterQuery(filters: Record<string, any>, options: QueryOptions = {}) {
  const query = filtersObjectToArray(filters, options).reduce((arr, { name, column, operator }) => {
    const isCohort = options?.isCohort;

    if (isCohort) {
      column = FILTER_COLUMNS[name.slice('cohort_'.length)];
    }

    if (column) {
      if (name === 'eventType') {
        arr.push(`and ${mapFilter(column, operator, name, 'UInt32')}`);
      } else {
        arr.push(`and ${mapFilter(column, operator, name)}`);
      }

      if (name === 'referrer') {
        arr.push(`and referrer_domain != hostname`);
      }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function getCohortQuery(filters: Record<string, any>) {
  if (!filters || Object.keys(filters).length === 0) {
    return '';
  }

  const filterQuery = getFilterQuery(filters, { isCohort: true });

  return `join (
      select distinct session_id
      from website_event
      where website_id = {websiteId:UUID}
      and created_at between {cohort_startDate:DateTime64} and {cohort_endDate:DateTime64}
      ${filterQuery}
    ) as cohort
      on cohort.session_id = website_event.session_id
    `;
}

function getDateQuery(filters: Record<string, any>) {
  const { startDate, endDate, timezone } = filters;

  if (startDate) {
    if (endDate) {
      if (timezone) {
        return `and created_at between toTimezone({startDate:DateTime64},{timezone:String}) and toTimezone({endDate:DateTime64},{timezone:String})`;
      }
      return `and created_at between {startDate:DateTime64} and {endDate:DateTime64}`;
    } else {
      if (timezone) {
        return `and created_at >= toTimezone({startDate:DateTime64},{timezone:String})`;
      }
      return `and created_at >= {startDate:DateTime64}`;
    }
  }

  return '';
}

function getQueryParams(filters: Record<string, any>) {
  return {
    ...filters,
    ...filtersObjectToArray(filters).reduce((obj, { name, value }) => {
      if (name && value !== undefined) {
        obj[name] = value;
      }

      return obj;
    }, {}),
  };
}

function parseFilters(filters: Record<string, any>, options?: QueryOptions) {
  const cohortFilters = Object.fromEntries(
    Object.entries(filters).filter(([key]) => key.startsWith('cohort_')),
  );

  return {
    filterQuery: getFilterQuery(filters, options),
    dateQuery: getDateQuery(filters),
    queryParams: getQueryParams(filters),
    cohortQuery: getCohortQuery(cohortFilters),
  };
}

async function pagedRawQuery(
  query: string,
  queryParams: Record<string, any>,
  filters: QueryFilters,
  name?: string,
) {
  const { page = 1, pageSize, orderBy, sortDescending = false, search } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);
  const direction = sortDescending ? 'desc' : 'asc';

  const statements = [
    orderBy && `order by ${orderBy} ${direction}`,
    +size > 0 && `limit ${+size} offset ${+offset}`,
  ]
    .filter(n => n)
    .join('\n');

  const count = await rawQuery(`select count(*) as num from (${query}) t`, queryParams).then(
    res => res[0].num,
  );

  const data = await rawQuery(`${query}${statements}`, queryParams, name);

  return { data, count, page: +page, pageSize: size, orderBy, search };
}

async function rawQuery<T = unknown>(
  query: string,
  params: Record<string, unknown> = {},
  name?: string,
): Promise<T> {
  if (process.env.LOG_QUERY) {
    log({ query, params, name });
  }

  await connect();

  const resultSet = await clickhouse.query({
    query: query,
    query_params: params,
    format: 'JSONEachRow',
    clickhouse_settings: {
      date_time_output_format: 'iso',
      output_format_json_quote_64bit_integers: 0,
    },
  });

  return (await resultSet.json()) as T;
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
    clickhouse = process.env.CLICKHOUSE_URL && (globalThis[CLICKHOUSE] || getClient());
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
  getSearchSQL,
  getFilterQuery,
  getUTCString,
  parseFilters,
  pagedRawQuery,
  findUnique,
  findFirst,
  rawQuery,
  insert,
};
