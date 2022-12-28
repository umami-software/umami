import prisma from '@umami/prisma-client';
import moment from 'moment-timezone';
import { MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
import { FILTER_IGNORED } from 'lib/constants';

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

function getDateQuery(field: string, unit: string, timezone?: string): string {
  const db = getDatabaseType(process.env.DATABASE_URL);

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

function getTimestampInterval(field: string): string {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db === POSTGRESQL) {
    return `floor(extract(epoch from max(${field}) - min(${field})))`;
  }

  if (db === MYSQL) {
    return `floor(unix_timestamp(max(${field})) - unix_timestamp(min(${field})))`;
  }
}

function getJsonField(column: string, property: string, isNumber: boolean): string {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db === POSTGRESQL) {
    let accessor = `${column} ->> '${property}'`;

    if (isNumber) {
      accessor = `CAST(${accessor} AS DECIMAL)`;
    }

    return accessor;
  }

  if (db === MYSQL) {
    return `${column} ->> "$.${property}"`;
  }
}

function getEventDataColumnsQuery(column, columns): string {
  const query = Object.keys(columns).reduce((arr, key) => {
    const filter = columns[key];

    if (filter === undefined) {
      return arr;
    }

    const isNumber = ['sum', 'avg', 'min', 'max'].some(a => a === filter);

    arr.push(`${filter}(${getJsonField(column, key, isNumber)}) as "${filter}(${key})"`);

    return arr;
  }, []);

  return query.join(',\n');
}

function getEventDataFilterQuery(column, filters): string {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined) {
      return arr;
    }

    const isNumber = filter && typeof filter === 'number';

    arr.push(
      `${getJsonField(column, key, isNumber)} = ${
        typeof filter === 'string' ? `'${filter}'` : filter
      }`,
    );

    return arr;
  }, []);

  return query.join('\nand ');
}

function getFilterQuery(filters = {}, params = []): string {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === FILTER_IGNORED) {
      return arr;
    }

    switch (key) {
      case 'url':
      case 'os':
      case 'browser':
      case 'device':
      case 'country':
        arr.push(`and ${key}=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;

      case 'eventName':
        arr.push(`and event_name=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;

      case 'referrer':
        arr.push(`and referrer like $${params.length + 1}`);
        params.push(`%${decodeURIComponent(filter)}%`);
        break;

      case 'domain':
        arr.push(`and referrer not like $${params.length + 1}`);
        arr.push(`and referrer not like '/%'`);
        params.push(`%://${filter}/%`);
        break;

      case 'query':
        arr.push(`and url like '%?%'`);
    }

    return arr;
  }, []);

  return query.join('\n');
}

function parseFilters(
  filters: { [key: string]: any } = {},
  params = [],
  sessionKey = 'session_id',
) {
  const { domain, url, eventUrl, referrer, os, browser, device, country, eventName, query } =
    filters;

  const pageviewFilters = { domain, url, referrer, query };
  const sessionFilters = { os, browser, device, country };
  const eventFilters = { url: eventUrl, eventName };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { eventName },
    joinSession:
      os || browser || device || country
        ? `inner join session on ${sessionKey} = session.${sessionKey}`
        : '',
    filterQuery: getFilterQuery(filters, params),
  };
}

async function rawQuery(query: string, params: never[] = []): Promise<any> {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db !== POSTGRESQL && db !== MYSQL) {
    return Promise.reject(new Error('Unknown database.'));
  }

  const sql = db === MYSQL ? query.replace(/\$[0-9]+/g, '?') : query;

  return prisma.rawQuery(sql, params);
}

export default {
  ...prisma,
  getDateQuery,
  getTimestampInterval,
  getFilterQuery,
  getEventDataColumnsQuery,
  getEventDataFilterQuery,
  parseFilters,
  rawQuery,
};
