import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import moment from 'moment-timezone';
import debug from 'debug';
import { PRISMA, MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
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

const log = debug('umami:prisma');

const PRISMA_OPTIONS = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

function logQuery(e) {
  log(chalk.yellow(e.params), '->', e.query, chalk.greenBright(`${e.duration}ms`));
}

function getClient(options) {
  const prisma = new PrismaClient(options);

  if (process.env.LOG_QUERY) {
    prisma.$on('query', logQuery);
  }

  if (process.env.NODE_ENV !== 'production') {
    global[PRISMA] = prisma;
  }

  log('Prisma initialized');

  return prisma;
}

function getDateQuery(field, unit, timezone) {
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

function getTimestampInterval(field) {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db === POSTGRESQL) {
    return `floor(extract(epoch from max(${field}) - min(${field})))`;
  }

  if (db === MYSQL) {
    return `floor(unix_timestamp(max(${field})) - unix_timestamp(min(${field})))`;
  }
}

function getJsonField(column, property, isNumber) {
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

function getEventDataColumnsQuery(column, columns) {
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

function getEventDataFilterQuery(column, filters) {
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

function getFilterQuery(table, column, filters = {}, params = []) {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === FILTER_IGNORED) {
      return arr;
    }

    switch (key) {
      case 'url':
        if (table === 'pageview' || table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(filter));
        }
        break;

      case 'os':
      case 'browser':
      case 'device':
      case 'country':
        if (table === 'session') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(filter));
        }
        break;

      case 'event_name':
        if (table === 'event') {
          arr.push(`and ${table}.${key}=$${params.length + 1}`);
          params.push(decodeURIComponent(filter));
        }
        break;

      case 'referrer':
        if (table === 'pageview' || table === 'event') {
          arr.push(`and ${table}.referrer like $${params.length + 1}`);
          params.push(`%${decodeURIComponent(filter)}%`);
        }
        break;

      case 'domain':
        if (table === 'pageview') {
          arr.push(`and ${table}.referrer not like $${params.length + 1}`);
          arr.push(`and ${table}.referrer not like '/%'`);
          params.push(`%://${filter}/%`);
        }
        break;

      case 'query':
        if (table === 'pageview') {
          arr.push(`and ${table}.url like '%?%'`);
        }
    }

    return arr;
  }, []);

  return query.join('\n');
}

function parseFilters(table, column, filters = {}, params = [], sessionKey = 'session_id') {
  const { domain, url, event_url, referrer, os, browser, device, country, event_name, query } =
    filters;

  const pageviewFilters = { domain, url, referrer, query };
  const sessionFilters = { os, browser, device, country };
  const eventFilters = { url: event_url, event_name };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { event_name },
    joinSession:
      os || browser || device || country
        ? `inner join session on ${table}.${sessionKey} = session.${sessionKey}`
        : '',
    pageviewQuery: getFilterQuery('pageview', column, pageviewFilters, params),
    sessionQuery: getFilterQuery('session', column, sessionFilters, params),
    eventQuery: getFilterQuery('event', column, eventFilters, params),
  };
}

async function rawQuery(query, params = []) {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db !== POSTGRESQL && db !== MYSQL) {
    return Promise.reject(new Error('Unknown database.'));
  }

  const sql = db === MYSQL ? query.replace(/\$[0-9]+/g, '?') : query;

  return prisma.$queryRawUnsafe.apply(prisma, [sql, ...params]);
}

async function transaction(queries) {
  return prisma.$transaction(queries);
}

// Initialization
const prisma = global[PRISMA] || getClient(PRISMA_OPTIONS);

export default {
  client: prisma,
  log,
  getDateQuery,
  getTimestampInterval,
  getFilterQuery,
  getEventDataColumnsQuery,
  getEventDataFilterQuery,
  parseFilters,
  rawQuery,
  transaction,
};
