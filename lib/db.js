import { PrismaClient } from '@prisma/client';
import { ClickHouse } from 'clickhouse';
import chalk from 'chalk';
import {
  MYSQL,
  MYSQL_DATE_FORMATS,
  POSTGRESQL,
  POSTGRESQL_DATE_FORMATS,
  CLICKHOUSE,
  RELATIONAL,
} from 'lib/constants';
import moment from 'moment-timezone';
import { CLICKHOUSE_DATE_FORMATS } from './constants';

BigInt.prototype.toJSON = function () {
  return Number(this);
};

const options = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

function logQuery(e) {
  console.log(chalk.yellow(e.params), '->', e.query, chalk.greenBright(`${e.duration}ms`));
}

function initializePrisma(options) {
  let prisma;

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient(options);
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient(options);
    }

    prisma = global.prisma;
  }

  if (process.env.LOG_QUERY) {
    prisma.$on('query', logQuery);
  }

  return prisma;
}

function initializeClickhouse() {
  if (!process.env.ANALYTICS_URL) {
    return null;
  }

  const url = new URL(process.env.ANALYTICS_URL);

  const database = url.pathname.replace('/', '');

  return new ClickHouse({
    url: url.hostname,
    port: Number(url.port),
    basicAuth: url.password
      ? {
          username: url.username || 'default',
          password: url.password,
        }
      : null,
    format: 'json',
    config: {
      database,
    },
  });

  // return new ClickHouse({
  //   url: 'http://164.92.95.2',
  //   port: 8123,
  //   basicAuth: {
  //     username: 'default',
  //     password: 'shhhthisissupersecret!',
  //   },
  //   format: 'json',
  //   config: {
  //     database: 'umami_dev',
  //   },
  // });
}

const prisma = initializePrisma(options);
const clickhouse = initializeClickhouse();

console.log('clickhouse1: ', clickhouse);

export { prisma, clickhouse };

export function getDatabase() {
  const type =
    process.env.DATABASE_TYPE ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.split(':')[0]);

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  return type;
}

export function getAnalyticsDatabase() {
  const type =
    process.env.ANALYTICS_TYPE ||
    (process.env.ANALYTICS_URL && process.env.ANALYTICS_URL.split(':')[0]);

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  if (!type) {
    return getDatabase();
  }

  return type;
}

export function getDateStringQuery(data, unit) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    return `to_char(${data}, '${POSTGRESQL_DATE_FORMATS[unit]}')`;
  }

  if (db === MYSQL) {
    return `DATE_FORMAT(${data}, '${MYSQL_DATE_FORMATS[unit]}')`;
  }
}

export function getDateStringQueryClickhouse(data, unit) {
  return `formatDateTime(${data}, '${CLICKHOUSE_DATE_FORMATS[unit]}')`;
}

export function getDateQuery(field, unit, timezone) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    if (timezone) {
      return `date_trunc('${unit}', ${field} at time zone '${timezone}')`;
    }
    return `date_trunc('${unit}', ${field})`;
  }

  if (db === MYSQL) {
    if (timezone) {
      const tz = moment.tz(timezone).format('Z');

      return `convert_tz(${field},'+00:00','${tz}')`;
    }

    return `${field}`;
  }
}

export function getDateQueryClickhouse(field, unit, timezone) {
  if (timezone) {
    return `date_trunc('${unit}', ${field},'${timezone}')`;
  }
  return `date_trunc('${unit}', ${field})`;
}

export function getDateFormatClickhouse(date) {
  return `parseDateTimeBestEffort('${date.toUTCString()}')`;
}

export function getBetweenDatesClickhouse(field, start_at, end_at) {
  return `${field} between ${getDateFormatClickhouse(start_at)} 
    and ${getDateFormatClickhouse(end_at)}`;
}

export function getTimestampInterval(maxColumn, minColumn) {
  const db = getDatabase();

  if (db === POSTGRESQL) {
    return `floor(extract(epoch from max(${maxColumn}) - min(${minColumn})))`;
  }

  if (db === MYSQL) {
    return `floor(unix_timestamp(max(${maxColumn})) - unix_timestamp(min(${minColumn})))`;
  }
}

export function getFilterQuery(table, filters = {}, params = []) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const value = filters[key];

    if (value === undefined) {
      return arr;
    }

    switch (key) {
      case 'url':
        if (table === 'pageview' || table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(value));
          console.log(params);
        }
        break;

      case 'os':
      case 'browser':
      case 'device':
      case 'country':
        if (table === 'session') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(value));
        }
        break;

      case 'event_type':
        if (table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(value));
        }
        break;

      case 'referrer':
        if (table === 'pageview') {
          arr.push(`and ${table}.referrer like $${params.length + 1}`);
          params.push(`%${decodeURIComponent(value)}%`);
        }
        break;

      case 'domain':
        if (table === 'pageview') {
          arr.push(`and ${table}.referrer not like $${params.length + 1}`);
          arr.push(`and ${table}.referrer not like '/%'`);
          params.push(`%://${value}/%`);
        }
        break;
    }

    return arr;
  }, []);

  return query.join('\n');
}

export function parseFilters(table, filters = {}, params = []) {
  const { domain, url, event_url, referrer, os, browser, device, country, event_type } = filters;

  const pageviewFilters = { domain, url, referrer };
  const sessionFilters = { os, browser, device, country };
  const eventFilters = { url: event_url, event_type };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { event_type },
    joinSession:
      os || browser || device || country
        ? `inner join session on ${table}.session_id = session.session_id`
        : '',
    pageviewQuery: getFilterQuery('pageview', pageviewFilters, params),
    sessionQuery: getFilterQuery('session', sessionFilters, params),
    eventQuery: getFilterQuery('event', eventFilters, params),
  };
}

export function replaceQueryClickhouse(string, params = []) {
  let formattedString = string;

  params.forEach((a, i) => {
    let replace = a;

    if (typeof a === 'string' || a instanceof String) {
      replace = `'${replace}'`;
    }

    formattedString = formattedString.replace(`$${i + 1}`, replace);
  });

  return formattedString;
}

export async function runQuery(query) {
  return query.catch(e => {
    throw e;
  });
}

export async function rawQuery(query, params = []) {
  const db = getDatabase();

  if (db !== POSTGRESQL && db !== MYSQL) {
    return Promise.reject(new Error('Unknown database.'));
  }

  const sql = db === MYSQL ? query.replace(/\$[0-9]+/g, '?') : query;

  return runQuery(prisma.$queryRawUnsafe.apply(prisma, [sql, ...params]));
}

export async function rawQueryClickhouse(query, params = [], debug = false) {
  let formattedQuery = replaceQueryClickhouse(query, params);

  if (debug || process.env.LOG_QUERY) {
    console.log(formattedQuery);
  }

  return clickhouse.query(formattedQuery).toPromise();
}

export async function runAnalyticsQuery(queries) {
  const db = getAnalyticsDatabase();

  if (db === POSTGRESQL || db === MYSQL) {
    return queries[`${RELATIONAL}`]();
  }

  if (db === CLICKHOUSE) {
    return queries[`${CLICKHOUSE}`]();
  }
}
