import debug from 'debug';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import { MYSQL, POSTGRESQL, getDatabaseType } from '@/lib/db';
import { SESSION_COLUMNS, OPERATORS, DEFAULT_PAGE_SIZE } from './constants';
import { QueryOptions, QueryFilters } from './types';
import { filtersToArray } from './params';

const log = debug('umami:prisma');

const PRISMA = 'prisma';
const PRISMA_LOG_OPTIONS = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

const POSTGRESQL_DATE_FORMATS = {
  minute: 'YYYY-MM-DD HH24:MI:00',
  hour: 'YYYY-MM-DD HH24:00:00',
  day: 'YYYY-MM-DD HH24:00:00',
  month: 'YYYY-MM-01 HH24:00:00',
  year: 'YYYY-01-01 HH24:00:00',
};

function getAddIntervalQuery(field: string, interval: string): string {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return `${field} + interval '${interval}'`;
  }

  if (db === MYSQL) {
    return `DATE_ADD(${field}, interval ${interval})`;
  }
}

function getDayDiffQuery(field1: string, field2: string): string {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return `${field1}::date - ${field2}::date`;
  }

  if (db === MYSQL) {
    return `DATEDIFF(${field1}, ${field2})`;
  }
}

function getCastColumnQuery(field: string, type: string): string {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return `${field}::${type}`;
  }

  if (db === MYSQL) {
    return `${field}`;
  }
}

function getDateSQL(field: string, unit: string, timezone?: string): string {
  if (timezone) {
    return `to_char(date_trunc('${unit}', ${field} at time zone '${timezone}'), '${POSTGRESQL_DATE_FORMATS[unit]}')`;
  }

  return `to_char(date_trunc('${unit}', ${field}), '${POSTGRESQL_DATE_FORMATS[unit]}')`;
}

function getDateWeeklySQL(field: string, timezone?: string) {
  return `concat(extract(dow from (${field} at time zone '${timezone}')), ':', to_char((${field} at time zone '${timezone}'), 'HH24'))`;
}

export function getTimestampSQL(field: string) {
  return `floor(extract(epoch from ${field}))`;
}

function getTimestampDiffSQL(field1: string, field2: string): string {
  return `floor(extract(epoch from (${field2} - ${field1})))`;
}

function getSearchSQL(column: string, param: string = 'search'): string {
  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';

  return `and ${column} ${like} {{${param}}}`;
}

function mapFilter(column: string, operator: string, name: string, type: string = '') {
  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';
  const value = `{{${name}${type ? `::${type}` : ''}}}`;

  switch (operator) {
    case OPERATORS.equals:
      return `${column} = ${value}`;
    case OPERATORS.notEquals:
      return `${column} != ${value}`;
    case OPERATORS.contains:
      return `${column} ${like} ${value}`;
    case OPERATORS.doesNotContain:
      return `${column} not ${like} ${value}`;
    default:
      return '';
  }
}

function getFilterQuery(filters: Record<string, any>, options: QueryOptions = {}): string {
  const query = filtersToArray(filters, options).reduce((arr, { name, column, operator }) => {
    if (column) {
      arr.push(`and ${mapFilter(column, operator, name)}`);

      if (name === 'referrer') {
        arr.push(
          `and (website_event.referrer_domain != website_event.hostname or website_event.referrer_domain is null)`,
        );
      }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function getDateQuery(filters: Record<string, any>) {
  const { startDate, endDate } = filters;

  if (startDate) {
    if (endDate) {
      return `and website_event.created_at between {{startDate}} and {{endDate}}`;
    } else {
      return `and website_event.created_at >= {{startDate}}`;
    }
  }

  return '';
}

function getQueryParams(filters: Record<string, any>) {
  return {
    ...filters,
    ...filtersToArray(filters).reduce((obj, { name, operator, value }) => {
      obj[name] = [OPERATORS.contains, OPERATORS.doesNotContain].includes(operator)
        ? `%${value}%`
        : value;

      return obj;
    }, {}),
  };
}

async function parseFilters(filters: Record<string, any>, options?: QueryOptions) {
  const joinSession = Object.keys(filters).find(key =>
    ['referrer', ...SESSION_COLUMNS].includes(key),
  );

  return {
    joinSessionQuery:
      options?.joinSession || joinSession
        ? `inner join session on website_event.session_id = session.session_id`
        : '',
    dateQuery: getDateQuery(filters),
    filterQuery: getFilterQuery(filters, options),
    queryParams: getQueryParams(filters),
  };
}

async function rawQuery(sql: string, data: object): Promise<any> {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', sql);
    log('PARAMETERS:\n', data);
  }

  const db = getDatabaseType();
  const params = [];

  if (db !== POSTGRESQL && db !== MYSQL) {
    return Promise.reject(new Error('Unknown database.'));
  }

  const query = sql?.replaceAll(/\{\{\s*(\w+)(::\w+)?\s*}}/g, (...args) => {
    const [, name, type] = args;

    const value = data[name];

    params.push(value);

    return db === MYSQL ? '?' : `$${params.length}${type ?? ''}`;
  });

  return process.env.DATABASE_REPLICA_URL
    ? client.$replica().$queryRawUnsafe(query, ...params)
    : client.$queryRawUnsafe(query, ...params);
}

async function pagedQuery<T>(model: string, criteria: T, filters?: QueryFilters) {
  const { page = 1, pageSize, orderBy, sortDescending = false } = filters || {};
  const size = +pageSize || DEFAULT_PAGE_SIZE;

  const data = await client[model].findMany({
    ...criteria,
    ...{
      ...(size > 0 && { take: +size, skip: +size * (+page - 1) }),
      ...(orderBy && {
        orderBy: [
          {
            [orderBy]: sortDescending ? 'desc' : 'asc',
          },
        ],
      }),
    },
  });

  const count = await client[model].count({ where: (criteria as any).where });

  return { data, count, page: +page, pageSize: size, orderBy };
}

async function pagedRawQuery(
  query: string,
  filters: QueryFilters,
  queryParams: Record<string, any>,
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

  const count = await rawQuery(`select count(*) as num from (${query}) t`, queryParams).then(
    res => res[0].num,
  );

  const data = await rawQuery(`${query}${statements}`, queryParams);

  return { data, count, page: +page, pageSize: size, orderBy };
}

function getQueryMode(): { mode?: 'default' | 'insensitive' } {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return { mode: 'insensitive' };
  }

  return {};
}

function getSearchParameters(query: string, filters: Record<string, any>[]) {
  if (!query) return;

  const mode = getQueryMode();
  const parseFilter = (filter: Record<string, any>) => {
    const [[key, value]] = Object.entries(filter);

    return {
      [key]:
        typeof value === 'string'
          ? {
              [value]: query,
              ...mode,
            }
          : parseFilter(value),
    };
  };

  const params = filters.map(filter => parseFilter(filter));

  return {
    AND: {
      OR: params,
    },
  };
}

function transaction(input: any, options?: any) {
  return client.$transaction(input, options);
}

function getClient(params?: {
  logQuery?: boolean;
  queryLogger?: () => void;
  replicaUrl?: string;
  options?: any;
}): PrismaClient {
  const {
    logQuery = !!process.env.LOG_QUERY,
    queryLogger,
    replicaUrl = process.env.DATABASE_REPLICA_URL,
    options,
  } = params || {};

  const url = new URL(process.env.DATABASE_URL);

  const adapter = new PrismaPg(
    { connectionString: url.toString() },
    { schema: url.searchParams.get('schema') },
  );

  const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    ...(logQuery && PRISMA_LOG_OPTIONS),
    ...options,
  });

  if (replicaUrl) {
    prisma.$extends(
      readReplicas({
        url: replicaUrl,
      }),
    );
  }

  if (logQuery) {
    prisma.$on('query' as never, queryLogger || log);
  }

  if (process.env.NODE_ENV !== 'production') {
    globalThis[PRISMA] = prisma;
  }

  log('Prisma initialized');

  return prisma;
}

const client = globalThis[PRISMA] || getClient();

export default {
  client,
  transaction,
  getAddIntervalQuery,
  getCastColumnQuery,
  getDayDiffQuery,
  getDateSQL,
  getDateWeeklySQL,
  getFilterQuery,
  getSearchParameters,
  getTimestampDiffSQL,
  getSearchSQL,
  getQueryMode,
  pagedQuery,
  pagedRawQuery,
  parseFilters,
  rawQuery,
};
