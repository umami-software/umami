import { Prisma } from '@prisma/client';
import prisma from '@umami/prisma-client';
import moment from 'moment-timezone';
import { MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
import { SESSION_COLUMNS, OPERATORS, DEFAULT_PAGE_SIZE } from './constants';
import { fetchWebsite } from './load';
import { maxDate } from './date';
import { QueryFilters, QueryOptions, PageParams } from './types';
import { filtersToArray } from './params';

const MYSQL_DATE_FORMATS = {
  minute: '%Y-%m-%d %H:%i:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
};

const POSTGRESQL_DATE_FORMATS = {
  minute: 'YYYY-MM-DD HH24:MI:00',
  hour: 'YYYY-MM-DD HH24:00:00',
  day: 'YYYY-MM-DD',
  month: 'YYYY-MM-01',
  year: 'YYYY-01-01',
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

function getDateQuery(field: string, unit: string, timezone?: string): string {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    if (timezone) {
      return `to_char(date_trunc('${unit}', ${field} at time zone '${timezone}'), '${POSTGRESQL_DATE_FORMATS[unit]}')`;
    }
    return `to_char(date_trunc('${unit}', ${field}), '${POSTGRESQL_DATE_FORMATS[unit]}')`;
  }

  if (db === MYSQL) {
    if (timezone) {
      const tz = moment.tz(timezone).format('Z');

      return `date_format(convert_tz(${field},'+00:00','${tz}'), '${MYSQL_DATE_FORMATS[unit]}')`;
    }

    return `date_format(${field}, '${MYSQL_DATE_FORMATS[unit]}')`;
  }
}

function getTimestampDiffQuery(field1: string, field2: string): string {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return `floor(extract(epoch from (${field2} - ${field1})))`;
  }

  if (db === MYSQL) {
    return `timestampdiff(second, ${field1}, ${field2})`;
  }
}

function getSearchQuery(column: string): string {
  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';

  return `and ${column} ${like} {{search}}`;
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

function getFilterQuery(filters: QueryFilters = {}, options: QueryOptions = {}): string {
  const query = filtersToArray(filters, options).reduce((arr, { name, column, operator }) => {
    if (column) {
      arr.push(`and ${mapFilter(column, operator, name)}`);

      if (name === 'referrer') {
        arr.push(
          'and (website_event.referrer_domain != {{websiteDomain}} or website_event.referrer_domain is null)',
        );
      }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function getFilterParams(filters: QueryFilters = {}) {
  return filtersToArray(filters).reduce((obj, { name, operator, value }) => {
    obj[name] = [OPERATORS.contains, OPERATORS.doesNotContain].includes(operator)
      ? `%${value}%`
      : value;

    return obj;
  }, {});
}

async function parseFilters(
  websiteId: string,
  filters: QueryFilters = {},
  options: QueryOptions = {},
) {
  const website = await fetchWebsite(websiteId);
  const joinSession = Object.keys(filters).find(key => SESSION_COLUMNS.includes(key));

  return {
    joinSession:
      options?.joinSession || joinSession
        ? `inner join session on website_event.session_id = session.session_id`
        : '',
    filterQuery: getFilterQuery(filters, options),
    params: {
      ...getFilterParams(filters),
      websiteId,
      startDate: maxDate(filters.startDate, website?.resetAt),
      websiteDomain: website.domain,
    },
  };
}

async function rawQuery(sql: string, data: object): Promise<any> {
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

  return prisma.rawQuery(query, params);
}

async function pagedQuery<T>(model: string, criteria: T, filters: PageParams) {
  const { page = 1, pageSize, orderBy, sortDescending = false } = filters || {};
  const size = +pageSize || DEFAULT_PAGE_SIZE;

  const data = await prisma.client[model].findMany({
    ...criteria,
    ...{
      ...(size > 0 && { take: +size, skip: +size * (page - 1) }),
      ...(orderBy && {
        orderBy: [
          {
            [orderBy]: sortDescending ? 'desc' : 'asc',
          },
        ],
      }),
    },
  });

  const count = await prisma.client[model].count({ where: (criteria as any).where });

  return { data, count, page: +page, pageSize: size, orderBy };
}

function getQueryMode(): { mode?: Prisma.QueryMode } {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return { mode: 'insensitive' };
  }

  return {};
}

function getSearchParameters(query: string, filters: { [key: string]: any }[]) {
  if (!query) return;

  const mode = getQueryMode();
  const parseFilter = (filter: { [key: string]: any }) => {
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

export default {
  ...prisma,
  getAddIntervalQuery,
  getCastColumnQuery,
  getDayDiffQuery,
  getDateQuery,
  getFilterQuery,
  getSearchParameters,
  getTimestampDiffQuery,
  getSearchQuery,
  getQueryMode,
  pagedQuery,
  parseFilters,
  rawQuery,
};
