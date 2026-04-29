import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import debug from 'debug';
import { DATA_TYPE, DEFAULT_PAGE_SIZE, FILTER_COLUMNS, OPERATORS, SESSION_COLUMNS } from './constants';
import { filtersObjectToArray } from './params';
import type { Operator, PropertyFilter, QueryFilters, QueryOptions } from './types';

const log = debug('umami:prisma');

const EQUALITY_OPERATORS: Operator[] = [OPERATORS.equals, OPERATORS.notEquals];
const SEARCH_OPERATORS: Operator[] = [OPERATORS.contains, OPERATORS.doesNotContain];
const REGEX_OPERATORS: Operator[] = [OPERATORS.regex, OPERATORS.notRegex];

const PRISMA = 'prisma';

const PRISMA_LOG_OPTIONS = {
  log: [
    {
      emit: 'event' as const,
      level: 'query' as const,
    },
  ],
};

const DATE_FORMATS = {
  minute: 'YYYY-MM-DD HH24:MI:00',
  hour: 'YYYY-MM-DD HH24:00:00',
  day: 'YYYY-MM-DD HH24:00:00',
  month: 'YYYY-MM-01 HH24:00:00',
  year: 'YYYY-01-01 HH24:00:00',
};

const DATE_FORMATS_UTC = {
  minute: 'YYYY-MM-DD"T"HH24:MI:00"Z"',
  hour: 'YYYY-MM-DD"T"HH24:00:00"Z"',
  day: 'YYYY-MM-DD"T"HH24:00:00"Z"',
  month: 'YYYY-MM-01"T"HH24:00:00"Z"',
  year: 'YYYY-01-01"T"HH24:00:00"Z"',
};

const DATE_STRING_FORMATS = {
  utc: 'YYYY-MM-DD"T"HH24:MI:SS"Z"',
  second: 'YYYY-MM-DD"T"HH24:MI:SS',
};

function isUtcTimezone(timezone?: string) {
  return timezone?.toLowerCase() === 'utc';
}

function getAddIntervalQuery(field: string, interval: string): string {
  return `${field} + interval '${interval}'`;
}

function getDayDiffQuery(field1: string, field2: string): string {
  return `${field1}::date - ${field2}::date`;
}

function getCastColumnQuery(field: string, type: string): string {
  return `${field}::${type}`;
}

function getDateSQL(field: string, unit: string, timezone?: string): string {
  if (timezone && !isUtcTimezone(timezone)) {
    return `to_char(date_trunc('${unit}', ${field} at time zone '${timezone}'), '${DATE_FORMATS[unit]}')`;
  }

  return `to_char(date_trunc('${unit}', ${field}), '${DATE_FORMATS_UTC[unit]}')`;
}

function getDateStringSQL(field: string, unit: keyof typeof DATE_STRING_FORMATS = 'utc', timezone?: string): string {
  if (timezone && !isUtcTimezone(timezone)) {
    return `to_char(${field} at time zone '${timezone}', '${DATE_STRING_FORMATS[unit]}')`;
  }

  return `to_char(${field}, '${DATE_STRING_FORMATS.utc}')`;
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
  return `and ${column} ilike {{${param}}}`;
}

function mapFilter(
  column: string,
  operator: string,
  name: string,
  type: string = '',
  paramName?: string,
) {
  const param = paramName ?? name;
  const value = `{{${param}${type ? `::${type}` : ''}}}`;

  if (name.startsWith('cohort_')) {
    name = name.slice('cohort_'.length);
  }

  const table = SESSION_COLUMNS.includes(name) ? 'session' : 'website_event';

  switch (operator) {
    case OPERATORS.equals:
      return `${table}.${column} = ANY(${value})`;
    case OPERATORS.notEquals:
      return `${table}.${column} != ALL(${value})`;
    case OPERATORS.contains:
      return `${table}.${column} ilike ${value}`;
    case OPERATORS.doesNotContain:
      return `${table}.${column} not ilike ${value}`;
    case OPERATORS.regex:
      return `${table}.${column} ~* ${value}`;
    case OPERATORS.notRegex:
      return `${table}.${column} !~* ${value}`;
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
        const clause = mapFilter(`${prefix}${column}`, operator, name, '', paramName);
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
            `and (website_event.referrer_domain != regexp_replace(website_event.hostname, '^www.', '') or website_event.referrer_domain is null)`,
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

function getCohortQuery(filters: QueryFilters = {}) {
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
    where website_event.website_id = {{websiteId}}
      and website_event.created_at between {{cohort_startDate}} and {{cohort_endDate}}
      ${filterQuery}
    ) cohort
    on cohort.session_id = website_event.session_id
    `;
}

function getExcludeBounceQuery(filters: Record<string, any>) {
  if (filters.excludeBounce !== true) {
    return '';
  }

  return `join
    (select distinct session_id, visit_id
    from website_event
    where website_id = {{websiteId}}
      and created_at between {{startDate}} and {{endDate}}
      and event_type = 1
    group by session_id, visit_id
    having count(*) > 1
    ) excludeBounce
    on excludeBounce.session_id = website_event.session_id
      and excludeBounce.visit_id = website_event.visit_id
    `;
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
    ...filtersObjectToArray(filters).reduce((obj, { name, column, operator, value, paramName }) => {
      const resolvedColumn =
        column || (name?.startsWith('cohort_') && FILTER_COLUMNS[name.slice('cohort_'.length)]);

      if (!resolvedColumn) return obj;

      const key = paramName ?? name;

      if (SEARCH_OPERATORS.includes(operator)) {
        obj[key] = `%${value}%`;
      } else if (EQUALITY_OPERATORS.includes(operator)) {
        obj[key] = Array.isArray(value) ? value : [value];
      } else {
        obj[key] = value;
      }

      return obj;
    }, {}),
  };
}

function parseFilters(filters: Record<string, any>, options?: QueryOptions) {
  const joinSession = Object.keys(filters).find(key => {
    const baseName = key.replace(/\d+$/, '');
    return ['referrer', ...SESSION_COLUMNS].includes(baseName);
  });

  const cohortFilters = Object.fromEntries(
    Object.entries(filters).filter(([key]) => key.startsWith('cohort_')),
  );

  return {
    joinSessionQuery:
      options?.joinSession || joinSession
        ? `inner join session on website_event.session_id = session.session_id and website_event.website_id = session.website_id`
        : '',
    dateQuery: getDateQuery(filters),
    filterQuery: getFilterQuery(filters, options),
    queryParams: getQueryParams(filters),
    cohortQuery: getCohortQuery(cohortFilters),
    excludeBounceQuery: getExcludeBounceQuery(filters),
  };
}

function getPropertyFilterQuery(
  filters: PropertyFilter[] = [],
  propertyType: 'event' | 'session' = 'event',
  timezone?: string,
): {
  sql: string;
  params: Record<string, any>;
} {
  if (!filters.length) return { sql: '', params: {} };

  const parts: string[] = [];
  const params: Record<string, any> = {};
  const table = propertyType === 'event' ? 'event_data' : 'session_data';
  const column = propertyType === 'event' ? 'website_event_id' : 'session_id';
  const outerColumn =
    propertyType === 'event' ? 'website_event.event_id' : 'website_event.session_id';

  filters.forEach(({ propertyName, dataType, operator, value }, i) => {
    const keyParam = `pf_key_${i}`;
    const valParam = `pf_val_${i}`;
    params[keyParam] = propertyName;

    let condition: string;
    switch (dataType) {
      case DATA_TYPE.number: {
        const col = 'cast(number_value as decimal)';
        params[valParam] = parseFloat(value) || 0;
        const opMap: Record<string, string> = {
          [OPERATORS.equals]: `${col} = {{${valParam}}}`,
          [OPERATORS.notEquals]: `${col} != {{${valParam}}}`,
          [OPERATORS.greaterThan]: `${col} > {{${valParam}}}`,
          [OPERATORS.lessThan]: `${col} < {{${valParam}}}`,
          [OPERATORS.greaterThanEquals]: `${col} >= {{${valParam}}}`,
          [OPERATORS.lessThanEquals]: `${col} <= {{${valParam}}}`,
        };
        condition = opMap[operator] ?? `${col} = {{${valParam}}}`;
        break;
      }
      case DATA_TYPE.date: {
        if (!value) return;
        params[valParam] = value;
        const dateCol =
          timezone && !isUtcTimezone(timezone)
            ? `(date_value at time zone {{timezone}})::date`
            : `(date_value at time zone 'utc')::date`;
        const opMap: Record<string, string> = {
          [OPERATORS.before]: `${dateCol} < {{${valParam}::date}}`,
          [OPERATORS.after]: `${dateCol} > {{${valParam}::date}}`,
        };
        condition = opMap[operator] ?? `${dateCol} = {{${valParam}::date}}`;
        break;
      }
      case DATA_TYPE.array: {
        if (!value) return;
        params[valParam] = value;
        condition =
          operator === OPERATORS.contains
            ? `exists (
                select 1
                from jsonb_array_elements_text(coalesce(string_value, '[]')::jsonb) as array_item(value)
                where array_item.value = {{${valParam}}}
              )`
            : `not exists (
                select 1
                from jsonb_array_elements_text(coalesce(string_value, '[]')::jsonb) as array_item(value)
                where array_item.value = {{${valParam}}}
              )`;
        break;
      }
      default: {
        const col = 'string_value';

        if (EQUALITY_OPERATORS.includes(operator)) {
          const vals = value.split(',').filter(Boolean);
          if (!vals.length) return;
          params[valParam] = vals;
          condition =
            operator === OPERATORS.equals
              ? `${col} = ANY({{${valParam}}})`
              : `${col} != ALL({{${valParam}}})`;
        } else if (REGEX_OPERATORS.includes(operator)) {
          if (!value) return;
          params[valParam] = value;
          condition =
            operator === OPERATORS.regex
              ? `${col} ~* {{${valParam}}}`
              : `${col} !~* {{${valParam}}}`;
        } else {
          if (!value) return;
          params[valParam] = `%${value}%`;
          condition =
            operator === OPERATORS.contains
              ? `${col} ilike {{${valParam}}}`
              : `${col} not ilike {{${valParam}}}`;
        }
        break;
      }
    }

    parts.push(`and ${outerColumn} in (
      select ${column}
      from ${table}
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
        and data_key = {{${keyParam}}}
        and data_type = ${dataType}
        and ${condition}
    )`);
  });

  return { sql: parts.join('\n'), params };
}

async function rawQuery(sql: string, data: Record<string, any>, name?: string): Promise<any> {
  if (process.env.LOG_QUERY) {
    log('QUERY:\n', sql);
    log('PARAMETERS:\n', data);
    log('NAME:\n', name);
  }
  const params = [];
  const schema = getSchema();

  if (schema) {
    await client.$executeRawUnsafe(`SET search_path TO "${schema}";`);
  }

  const query = sql?.replaceAll(/\{\{\s*(\w+)(::\w+)?\s*}}/g, (...args) => {
    const [, name, type] = args;

    const value = data[name];

    params.push(value);

    return `$${params.length}${type ?? ''}`;
  });

  if (process.env.DATABASE_REPLICA_URL && '$replica' in client) {
    return client.$replica().$queryRawUnsafe(query, ...params);
  }
  return client.$queryRawUnsafe(query, ...params);
}

async function pagedQuery<T>(model: string, criteria: T, filters?: QueryFilters) {
  const { page = 1, pageSize, orderBy, sortDescending = false, search } = filters || {};
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

  return { data, count, page: +page, pageSize: size, orderBy, search };
}

async function pagedRawQuery(
  query: string,
  queryParams: Record<string, any>,
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

  const count = await rawQuery(`select count(*) as num from (${query}) t`, queryParams).then(
    res => res[0].num,
  );

  const data = await rawQuery(`${query}${statements}`, queryParams, name);

  return { data, count, page: +page, pageSize: size, orderBy };
}

function getSearchParameters(query: string, filters: Record<string, any>[]) {
  if (!query) return;

  const parseFilter = (filter: Record<string, any>) => {
    const [[key, value]] = Object.entries(filter);

    return {
      [key]:
        typeof value === 'string'
          ? {
              [value]: query,
              mode: 'insensitive',
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

function getSchema() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const connectionUrl = new URL(databaseUrl);

  return connectionUrl.searchParams.get('schema');
}

function getClient() {
  const url = process.env.DATABASE_URL;
  const replicaUrl = process.env.DATABASE_REPLICA_URL;
  const logQuery = process.env.LOG_QUERY;

  if (!url) {
    throw new Error('DATABASE_URL is not set.');
  }

  const schema = getSchema();

  const baseAdapter = new PrismaPg({ connectionString: url }, { schema });

  const baseClient = new PrismaClient({
    adapter: baseAdapter,
    errorFormat: 'pretty',
    ...(logQuery ? PRISMA_LOG_OPTIONS : {}),
  });

  if (logQuery) {
    baseClient.$on('query', log);
  }

  if (!replicaUrl) {
    log('Prisma initialized');
    globalThis[PRISMA] ??= baseClient;
    return baseClient;
  }

  const replicaAdapter = new PrismaPg({ connectionString: replicaUrl }, { schema });

  const replicaClient = new PrismaClient({
    adapter: replicaAdapter,
    errorFormat: 'pretty',
    ...(logQuery ? PRISMA_LOG_OPTIONS : {}),
  });

  if (logQuery) {
    replicaClient.$on('query', log);
  }

  const extended = baseClient.$extends(
    readReplicas({
      replicas: [replicaClient],
    }),
  );

  log('Prisma initialized (with replica)');
  globalThis[PRISMA] ??= extended;

  return extended;
}

const client = (globalThis[PRISMA] || getClient()) as ReturnType<typeof getClient>;

export default {
  client,
  transaction,
  getAddIntervalQuery,
  getCastColumnQuery,
  getDayDiffQuery,
  getDateSQL,
  getDateStringSQL,
  getDateWeeklySQL,
  getFilterQuery,
  getPropertyFilterQuery,
  getSearchParameters,
  getTimestampDiffSQL,
  getSearchSQL,
  pagedQuery,
  pagedRawQuery,
  parseFilters,
  rawQuery,
};
