import prisma from '@umami/prisma-client';
import moment from 'moment-timezone';
import { MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
import { FILTER_COLUMNS, IGNORED_FILTERS, SESSION_COLUMNS } from './constants';
import { loadWebsite } from './load';
import { maxDate } from './date';
import { QueryFilters, QueryOptions } from './types';

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

function getAddMinutesQuery(field: string, minutes: number): string {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db === POSTGRESQL) {
    return `${field} + interval '${minutes} minute'`;
  }

  if (db === MYSQL) {
    return `DATE_ADD(${field}, interval ${minutes} minute)`;
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

function getTimestampIntervalQuery(field: string): string {
  const db = getDatabaseType();

  if (db === POSTGRESQL) {
    return `floor(extract(epoch from max(${field}) - min(${field})))`;
  }

  if (db === MYSQL) {
    return `floor(unix_timestamp(max(${field})) - unix_timestamp(min(${field})))`;
  }
}

function getFilterQuery(filters = {}): string {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter !== undefined && !IGNORED_FILTERS.includes(key)) {
      const column = FILTER_COLUMNS[key] || key;
      arr.push(`and ${column}={{${key}}}`);
    }

    if (key === 'referrer') {
      arr.push(
        'and (website_event.referrer_domain != {{websiteDomain}} or website_event.referrer_domain is null)',
      );
    }

    return arr;
  }, []);

  return query.join('\n');
}

async function parseFilters(
  websiteId,
  filters: QueryFilters & { [key: string]: any } = {},
  options: QueryOptions = {},
) {
  const website = await loadWebsite(websiteId);

  return {
    joinSession:
      options?.joinSession || Object.keys(filters).find(key => SESSION_COLUMNS.includes(key))
        ? `inner join session on website_event.session_id = session.session_id`
        : '',
    filterQuery: getFilterQuery(filters),
    params: {
      ...filters,
      websiteId,
      startDate: maxDate(filters.startDate, website.resetAt),
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
    params.push(data[name]);

    return db === MYSQL ? '?' : `$${params.length}${type ?? ''}`;
  });

  return prisma.rawQuery(query, params);
}

export default {
  ...prisma,
  getAddMinutesQuery,
  getDateQuery,
  getTimestampIntervalQuery,
  getFilterQuery,
  parseFilters,
  rawQuery,
};
