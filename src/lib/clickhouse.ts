import { CLICKHOUSE } from '@/lib/db';
import { type ClickHouseClient, createClient } from '@clickhouse/client';
import { formatInTimeZone } from 'date-fns-tz';
import debug from 'debug';
import { DATA_TYPE, DEFAULT_PAGE_SIZE, FILTER_COLUMNS, OPERATORS } from './constants';
import { filtersObjectToArray } from './params';
import type { EventPropertyFilter, Operator, QueryFilters, QueryOptions } from './types';

export const CLICKHOUSE_DATE_FORMATS = {
  utc: '%Y-%m-%dT%H:%i:%SZ',
  second: '%Y-%m-%dT%H:%i:%S',
  minute: '%Y-%m-%d %H:%i:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
};

const log = debug('umami:clickhouse');

const EQUALITY_OPERATORS: Operator[] = [OPERATORS.equals, OPERATORS.notEquals];
const REGEX_OPERATORS: Operator[] = [OPERATORS.regex, OPERATORS.notRegex];

let clickhouse: ClickHouseClient;
const enabled = Boolean(process.env.CLICKHOUSE_URL);

function getClient() {
  const clickhouseUrl = process.env.CLICKHOUSE_URL;

  if (!clickhouseUrl) {
    throw new Error('CLICKHOUSE_URL is not set.');
  }

  const {
    hostname,
    port,
    pathname,
    protocol,
    username = 'default',
    password,
  } = new URL(clickhouseUrl);

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
    return `toDateTime(date_trunc('${unit}', ${field}, '${timezone}'), '${timezone}')`;
  }
  return `toDateTime(date_trunc('${unit}', ${field}))`;
}

function getSearchSQL(column: string, param: string = 'search'): string {
  return `and positionCaseInsensitive(${column}, {${param}:String}) > 0`;
}

function mapFilter(column: string, operator: Operator, name: string, type: string = 'String', paramName?: string) {
  const param = paramName ?? name;
  const value = `{${param}:${type}}`;

  switch (operator) {
    case OPERATORS.equals:
      return `${column} IN {${param}:Array(${type})}`;
    case OPERATORS.notEquals:
      return `${column} NOT IN {${param}:Array(${type})}`;
    case OPERATORS.contains:
      return `positionCaseInsensitive(${column}, ${value}) > 0`;
    case OPERATORS.doesNotContain:
      return `positionCaseInsensitive(${column}, ${value}) = 0`;
    case OPERATORS.regex:
      return `match(${column}, concat('(?i)', ${value}))`;
    case OPERATORS.notRegex:
      return `not match(${column}, concat('(?i)', ${value}))`;
    default:
      return '';
  }
}

function getFilterQuery(filters: Record<string, any>, options: QueryOptions = {}) {
  const { isCohort, cohortMatch, cohortActionName } = options;
  const isOr = isCohort ? cohortMatch === 'any' : filters.match === 'any';
  const orClauses: string[] = [];
  const andClauses: string[] = [];

  filtersObjectToArray(filters, options).forEach(({ name, column, operator, paramName }) => {
    if (isCohort) {
      column = FILTER_COLUMNS[name.slice('cohort_'.length)];
    }

    if (column) {
      const isAlwaysAnd = name === 'eventType' || (isCohort && name === cohortActionName);

      if (isAlwaysAnd) {
        andClauses.push(
          `and ${mapFilter(column, operator, name, name === 'eventType' ? 'UInt32' : 'String', paramName)}`,
        );
      } else if (isOr) {
        orClauses.push(mapFilter(column, operator, name, 'String', paramName));
      } else {
        andClauses.push(`and ${mapFilter(column, operator, name, 'String', paramName)}`);
      }

      if (name === 'referrer') {
        andClauses.push(`and referrer_domain != hostname`);
      }
    }
  });

  const parts: string[] = [];

  if (orClauses.length > 0) {
    parts.push(`and (\n  ${orClauses.join('\n  or ')}\n)`);
  }

  parts.push(...andClauses);

  return parts.join('\n');
}

function getCohortQuery(filters: Record<string, any>) {
  if (!filters || Object.keys(filters).length === 0) {
    return '';
  }

  const cohortMatch = filters.cohort_match;
  const cohortActionName = filters.cohort_actionName;

  const filterQuery = getFilterQuery(filters, { isCohort: true, cohortMatch, cohortActionName });

  return `join (
      select distinct session_id as cohort_session_id
      from website_event
      where website_id = {websiteId:UUID}
      and created_at between {cohort_startDate:DateTime64} and {cohort_endDate:DateTime64}
      ${filterQuery}
    ) as cohort
      on cohort.cohort_session_id = website_event.session_id
    `;
}

function getExcludeBounceQuery(filters: Record<string, any>) {
  if (filters.excludeBounce !== true) {
    return '';
  }

  return `join
    (select distinct session_id as exclude_session_id, visit_id as exclude_visit_id
    from website_event_stats_hourly
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = 1
    group by session_id, visit_id
    having sum(views) > 1
    ) excludeBounce
    on excludeBounce.exclude_session_id = website_event.session_id
      and excludeBounce.exclude_visit_id = website_event.visit_id
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
    ...filtersObjectToArray(filters).reduce((obj, { name, column, operator, value, paramName }) => {
      const resolvedColumn =
        column || (name?.startsWith('cohort_') && FILTER_COLUMNS[name.slice('cohort_'.length)]);

      if (!resolvedColumn || !name || value === undefined) return obj;

      const key = paramName ?? name;

      obj[key] = EQUALITY_OPERATORS.includes(operator)
        ? Array.isArray(value)
          ? value
          : [value]
        : value;

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
    excludeBounceQuery: getExcludeBounceQuery(filters),
  };
}

function getEventPropertyFilterQuery(
  filters: EventPropertyFilter[] = [],
  timezone?: string,
): {
  sql: string;
  params: Record<string, any>;
} {
  if (!filters.length) return { sql: '', params: {} };

  const parts: string[] = [];
  const params: Record<string, any> = {};

  filters.forEach(({ propertyName, dataType, operator, value }, i) => {
    const keyParam = `epf_key_${i}`;
    const valParam = `epf_val_${i}`;
    params[keyParam] = propertyName;

    let condition: string;
    switch (dataType) {
      case DATA_TYPE.number: {
        const col = 'number_value';
        params[valParam] = parseFloat(value) || 0;
        const opMap: Record<string, string> = {
          [OPERATORS.equals]: `${col} = {${valParam}:Float64}`,
          [OPERATORS.notEquals]: `${col} != {${valParam}:Float64}`,
          [OPERATORS.greaterThan]: `${col} > {${valParam}:Float64}`,
          [OPERATORS.lessThan]: `${col} < {${valParam}:Float64}`,
          [OPERATORS.greaterThanEquals]: `${col} >= {${valParam}:Float64}`,
          [OPERATORS.lessThanEquals]: `${col} <= {${valParam}:Float64}`,
        };
        condition = opMap[operator] ?? `${col} = {${valParam}:Float64}`;
        break;
      }
      case DATA_TYPE.date: {
        if (!value) return;
        params[valParam] = value;
        const dateCol = timezone
          ? `toDate(toTimezone(date_value, {timezone:String}))`
          : `toDate(toTimezone(date_value, 'UTC'))`;
        const opMap: Record<string, string> = {
          [OPERATORS.before]: `${dateCol} < {${valParam}:Date}`,
          [OPERATORS.after]: `${dateCol} > {${valParam}:Date}`,
        };
        condition = opMap[operator] ?? `${dateCol} = {${valParam}:Date}`;
        break;
      }
      case DATA_TYPE.array: {
        if (!value) return;
        params[valParam] = value;
        condition =
          operator === OPERATORS.contains
            ? `has(JSONExtract(ifNull(string_value, '[]'), 'Array(String)'), {${valParam}:String})`
            : `not has(JSONExtract(ifNull(string_value, '[]'), 'Array(String)'), {${valParam}:String})`;
        break;
      }
      default: {
        const col = 'string_value';

        if (EQUALITY_OPERATORS.includes(operator)) {
          const vals = value.split(',').filter(Boolean);
          if (!vals.length) return;
          params[valParam] = vals;
          condition = mapFilter(
            col,
            operator === OPERATORS.equals ? OPERATORS.equals : OPERATORS.notEquals,
            valParam,
            'String',
          );
        } else if (REGEX_OPERATORS.includes(operator)) {
          if (!value) return;
          params[valParam] = value;
          condition = mapFilter(
            col,
            operator === OPERATORS.regex ? OPERATORS.regex : OPERATORS.notRegex,
            valParam,
            'String',
          );
        } else {
          if (!value) return;
          params[valParam] = value;
          condition = mapFilter(
            col,
            operator === OPERATORS.contains ? OPERATORS.contains : OPERATORS.doesNotContain,
            valParam,
            'String',
          );
        }
        break;
      }
    }

    parts.push(`and event_id in (
      select event_id 
      from event_data
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and data_key = {${keyParam}:String}
        and data_type = ${dataType}
        and ${condition}
    )`);
  });

  return { sql: parts.join('\n'), params };
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
    clickhouse = globalThis[CLICKHOUSE] || getClient();
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
  getEventPropertyFilterQuery,
  getUTCString,
  parseFilters,
  pagedRawQuery,
  findUnique,
  findFirst,
  rawQuery,
  insert,
};
