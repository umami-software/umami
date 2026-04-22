import mysql, { type Pool, type PoolConnection, type RowDataPacket } from 'mysql2/promise';
import { formatInTimeZone } from 'date-fns-tz';
import debug from 'debug';
import { OCEANBASE } from './db';
import { DEFAULT_PAGE_SIZE, FILTER_COLUMNS, OPERATORS, SESSION_COLUMNS } from './constants';
import { filtersObjectToArray } from './params';
import type { Operator, QueryFilters, QueryOptions } from './types';

const log = debug('umami:oceanbase');

const DATE_FORMATS = {
  minute: '%Y-%m-%d %H:%i:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
};

let pool: Pool;
const enabled = Boolean(process.env.OCEANBASE_URL);

function getPool(): Pool {
  if (!enabled) {
    throw new Error('OceanBase is not enabled. Set OCEANBASE_URL environment variable.');
  }
  if (!pool) {
    const url = new URL(process.env.OCEANBASE_URL!);

    pool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || 2881,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: parseInt(process.env.OCEANBASE_POOL_SIZE || '10'),
      queueLimit: 0,
      timezone: 'Z',
    });

    log('OceanBase pool initialized');
  }

  return pool;
}

async function getConnection(): Promise<PoolConnection> {
  const p = getPool();
  return p.getConnection();
}

function getAddIntervalQuery(field: string, interval: string): string {
  const match = interval.match(/^(\d+)\s+(minute|hour|day|month|year)s?$/i);
  if (!match) return field;
  const [, amount, unit] = match;
  const unitMap: Record<string, string> = {
    minute: 'MINUTE',
    hour: 'HOUR',
    day: 'DAY',
    month: 'MONTH',
    year: 'YEAR',
  };
  return `DATE_ADD(${field}, INTERVAL ${amount} ${unitMap[unit.toLowerCase()] || 'MINUTE'})`;
}

function getDayDiffQuery(field1: string, field2: string): string {
  return `DATEDIFF(${field1}, ${field2})`;
}

function getCastColumnQuery(field: string, type: string): string {
  const typeMap: Record<string, string> = {
    bigint: 'SIGNED',
    integer: 'SIGNED',
    float: 'DECIMAL(65,10)',
    double: 'DECIMAL(65,10)',
    boolean: 'SIGNED',
  };
  return `CAST(${field} AS ${typeMap[type] || type})`;
}

function getDateSQL(field: string, unit: string, timezone?: string): string {
  if (timezone && timezone !== 'utc') {
    return `DATE_FORMAT(CONVERT_TZ(${field}, 'UTC', '${timezone}'), '${DATE_FORMATS[unit]}')`;
  }
  return `DATE_FORMAT(${field}, '${DATE_FORMATS[unit]}')`;
}

function getDateWeeklySQL(field: string, timezone?: string): string {
  if (timezone && timezone !== 'utc') {
    return `CONCAT(DAYOFWEEK(CONVERT_TZ(${field}, 'UTC', '${timezone}')) - 1, ':', DATE_FORMAT(CONVERT_TZ(${field}, 'UTC', '${timezone}'), '%H'))`;
  }
  return `CONCAT(DAYOFWEEK(${field}) - 1, ':', DATE_FORMAT(${field}, '%H'))`;
}

export function getTimestampSQL(field: string): string {
  return `UNIX_TIMESTAMP(${field})`;
}

function getTimestampDiffSQL(field1: string, field2: string): string {
  return `UNIX_TIMESTAMP(${field2}) - UNIX_TIMESTAMP(${field1})`;
}

function getSearchSQL(column: string, param: string = 'search'): string {
  return `and LOWER(${column}) LIKE LOWER(?)`;
}

function mapFilter(
  column: string,
  operator: string,
  name: string,
  table: string = 'website_event',
): string {
  switch (operator) {
    case OPERATORS.equals:
      return `${table}.${column} IN (?)`;
    case OPERATORS.notEquals:
      return `${table}.${column} NOT IN (?)`;
    case OPERATORS.contains:
      return `LOWER(${table}.${column}) LIKE LOWER(?)`;
    case OPERATORS.doesNotContain:
      return `LOWER(${table}.${column}) NOT LIKE LOWER(?)`;
    case OPERATORS.regex:
      return `${table}.${column} REGEXP ?`;
    case OPERATORS.notRegex:
      return `${table}.${column} NOT REGEXP ?`;
    default:
      return '';
  }
}

function getFilterQuery(filters: Record<string, any>, options: QueryOptions = {}): string {
  const { isCohort, cohortMatch, cohortActionName } = options;
  const isOr = isCohort ? cohortMatch === 'any' : filters.match === 'any';
  const orClauses: string[] = [];
  const andClauses: string[] = [];

  filtersObjectToArray(filters, options).forEach(
    ({ name, column, operator, prefix = '', paramName }) => {
      if (isCohort) {
        column = FILTER_COLUMNS[name.slice('cohort_'.length)];
      }

      if (column) {
        const table = SESSION_COLUMNS.includes(name.replace(/\d+$/, ''))
          ? 'session'
          : 'website_event';
        const clause = mapFilter(`${prefix}${column}`, operator, name, table);
        const isAlwaysAnd = name === 'eventType' || (isCohort && name === cohortActionName);

        if (isAlwaysAnd) {
          andClauses.push(`and ${clause}`);
        } else if (isOr) {
          orClauses.push(clause);
        } else {
          andClauses.push(`and ${clause}`);
        }

        if (name === 'referrer') {
          andClauses.push(
            `and (website_event.referrer_domain != REGEXP_REPLACE(website_event.hostname, '^www.', '') or website_event.referrer_domain is null)`,
          );
        }
      }
    },
  );

  const parts: string[] = [];

  if (orClauses.length > 0) {
    parts.push(`and (\n  ${orClauses.join('\n  or ')}\n)`);
  }

  parts.push(...andClauses);

  return parts.join('\n');
}

function getCohortQuery(filters: QueryFilters = {}): string {
  if (!filters || Object.keys(filters).length === 0) {
    return '';
  }

  const cohortMatch = (filters as any).cohort_match;
  const cohortActionName = (filters as any).cohort_actionName;

  const filterQuery = getFilterQuery(filters, { isCohort: true, cohortMatch, cohortActionName });

  return `join
    (select distinct website_event.session_id
    from website_event
    join session on session.session_id = website_event.session_id
      and session.website_id = website_event.website_id
    where website_event.website_id = ?
      and website_event.created_at between ? and ?
      ${filterQuery}
    ) cohort
    on cohort.session_id = website_event.session_id
    `;
}

function getExcludeBounceQuery(filters: Record<string, any>): string {
  if (filters.excludeBounce !== true) {
    return '';
  }

  return `join
    (select distinct session_id, visit_id
    from website_event
    where website_id = ?
      and created_at between ? and ?
      and event_type = 1
    group by session_id, visit_id
    having count(*) > 1
    ) excludeBounce
    on excludeBounce.session_id = website_event.session_id
      and excludeBounce.visit_id = website_event.visit_id
    `;
}

function getDateQuery(filters: Record<string, any>): string {
  const { startDate, endDate } = filters;

  if (startDate) {
    if (endDate) {
      return 'and website_event.created_at between ? and ?';
    } else {
      return 'and website_event.created_at >= ?';
    }
  }

  return '';
}

function getQueryParams(filters: Record<string, any>): any[] {
  const params: any[] = [];

  filtersObjectToArray(filters).forEach(({ name, column, operator, value, paramName }) => {
    const resolvedColumn =
      column || (name?.startsWith('cohort_') && FILTER_COLUMNS[name.slice('cohort_'.length)]);

    if (!resolvedColumn) return;

    if (([OPERATORS.contains, OPERATORS.doesNotContain] as Operator[]).includes(operator)) {
      params.push(`%${value}%`);
    } else if (([OPERATORS.equals, OPERATORS.notEquals] as Operator[]).includes(operator)) {
      params.push(Array.isArray(value) ? value : [value]);
    } else {
      params.push(value);
    }
  });

  return params;
}

function parseFilters(filters: Record<string, any>, options?: QueryOptions) {
  const joinSession = Object.keys(filters).find(key => {
    const baseName = key.replace(/\d+$/, '');
    return ['referrer', ...SESSION_COLUMNS].includes(baseName);
  });

  const cohortFilters = Object.fromEntries(
    Object.entries(filters).filter(([key]) => key.startsWith('cohort_')),
  );

  const cohortQuery = getCohortQuery(cohortFilters);
  const excludeBounceQuery = getExcludeBounceQuery(filters);
  const dateQuery = getDateQuery(filters);
  const filterQuery = getFilterQuery(filters, options);
  const queryParams = getQueryParams(filters);
  const { websiteId, startDate, endDate } = filters;

  // Helper to get date params for dateQuery
  const getDateParams = () => {
    if (startDate && endDate) {
      return [startDate, endDate];
    }
    if (startDate) {
      return [startDate];
    }
    return [];
  };

  return {
    joinSessionQuery:
      options?.joinSession || joinSession
        ? 'inner join session on website_event.session_id = session.session_id and website_event.website_id = session.website_id'
        : '',
    dateQuery,
    filterQuery,
    queryParams,
    cohortQuery,
    excludeBounceQuery,
    getDateParams,
    // Helper to build complete params array for OceanBase positional parameters
    // Use this when dateQuery appears BEFORE filterQuery in SQL
    buildParams: (baseParams: any[] = []) => {
      const params: any[] = [];

      // Add cohortQuery params if present (3 placeholders: websiteId, startDate, endDate)
      if (cohortQuery) {
        params.push(websiteId, startDate, endDate);
      }

      // Add excludeBounceQuery params if present (3 placeholders: websiteId, startDate, endDate)
      if (excludeBounceQuery) {
        params.push(websiteId, startDate, endDate);
      }

      // Add base params (typically websiteId, startDate, endDate for main WHERE clause)
      params.push(...baseParams);

      // Add filter condition params
      params.push(...queryParams);

      return params;
    },
    // Helper for when dateQuery appears AFTER filterQuery in SQL
    // Use: buildParams([...baseParams, ...getDateParams()])
  };
}

async function rawQuery<T = unknown>(
  sql: string,
  params: any[] = [],
  name?: string,
): Promise<T> {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', sql);
    log('PARAMETERS:\n', params);
    log('NAME:\n', name);
  }

  const connection = await getConnection();

  try {
    const [rows] = await connection.execute(sql, params);
    return rows as unknown as T;
  } catch (error) {
    log('QUERY ERROR:', error);
    log('SQL:', sql);
    log('PARAMETERS:', params);
    throw error;
  } finally {
    connection.release();
  }
}

async function pagedRawQuery(
  query: string,
  queryParams: any[],
  filters: QueryFilters,
  name?: string,
) {
  const { page = 1, pageSize, orderBy, sortDescending = false } = filters;
  const size = +pageSize || DEFAULT_PAGE_SIZE;
  const offset = +size * (+page - 1);
  const direction = sortDescending ? 'desc' : 'asc';

  const statements = [
    orderBy && `order by ${orderBy} ${direction}`,
    +size > 0 && `limit ${+size} offset ${offset}`,
  ]
    .filter(n => n)
    .join('\n');

  const countResult = await rawQuery<RowDataPacket[]>(
    `select count(*) as num from (${query}) t`,
    queryParams,
  );
  const count = countResult[0]?.num || 0;

  const data = await rawQuery(`${query}${statements}`, queryParams, name);

  return { data, count, page: +page, pageSize: size, orderBy };
}

async function insert(table: string, data: Record<string, any>): Promise<string> {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data)
    .map(() => '?')
    .join(', ');
  const values = Object.values(data);

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  const result = await rawQuery<any>(sql, values);

  return result.insertId;
}

async function insertBatch(table: string, data: Record<string, any>[]): Promise<void> {
  if (data.length === 0) return;

  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0])
    .map(() => '?')
    .join(', ');
  const values = data.flatMap(row => Object.values(row));

  const sql = `INSERT INTO ${table} (${columns}) VALUES ${data.map(() => `(${placeholders})`).join(', ')}`;
  await rawQuery(sql, values);
}

async function findUnique<T = any>(data: T[]): Promise<T | null> {
  if (data.length > 1) {
    throw new Error(`${data.length} records found when expecting 1.`);
  }
  return data[0] ?? null;
}

async function findFirst<T = any>(data: T[]): Promise<T | null> {
  return data[0] ?? null;
}

function getUTCString(date?: Date | string | number): string {
  return formatInTimeZone(date || new Date(), 'UTC', 'yyyy-MM-dd HH:mm:ss');
}

export default {
  enabled,
  getPool,
  getConnection,
  log,
  getAddIntervalQuery,
  getCastColumnQuery,
  getDayDiffQuery,
  getDateSQL,
  getDateWeeklySQL,
  getFilterQuery,
  getTimestampDiffSQL,
  getTimestampSQL,
  getSearchSQL,
  parseFilters,
  pagedRawQuery,
  findUnique,
  findFirst,
  rawQuery,
  insert,
  insertBatch,
  getUTCString,
};