import prisma from '@umami/prisma-client';
import moment from 'moment-timezone';
import { MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
import { FILTER_IGNORED } from 'lib/constants';
import { getEventDataType } from './eventData';

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

function toUuid(): string {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db === POSTGRESQL) {
    return '::uuid';
  }

  if (db === MYSQL) {
    return '';
  }
}

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

function getEventDataFilterQuery(
  filters: {
    eventKey?: string;
    eventValue?: string | number | boolean | Date;
  }[],
  params: any[],
) {
  const query = filters.reduce((ac, cv) => {
    const type = getEventDataType(cv.eventValue);

    let value = cv.eventValue;

    ac.push(`and (event_key = $${params.length + 1}`);
    params.push(cv.eventKey);

    switch (type) {
      case 'number':
        ac.push(`and event_numeric_value = $${params.length + 1})`);
        params.push(value);
        break;
      case 'string':
        ac.push(`and event_string_value = $${params.length + 1})`);
        params.push(decodeURIComponent(cv.eventValue as string));
        break;
      case 'boolean':
        ac.push(`and event_string_value = $${params.length + 1})`);
        params.push(decodeURIComponent(cv.eventValue as string));
        value = cv ? 'true' : 'false';
        break;
      case 'date':
        ac.push(`and event_date_value = $${params.length + 1})`);
        params.push(cv.eventValue);
        break;
    }

    return ac;
  }, []);

  return query.join('\n');
}

function getFilterQuery(filters = {}, params = []): string {
  const query = Object.keys(filters).reduce((arr, key) => {
    const filter = filters[key];

    if (filter === undefined || filter === FILTER_IGNORED) {
      return arr;
    }

    switch (key) {
      case 'url':
        arr.push(`and url_path=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;
      case 'os':
      case 'pageTitle':
      case 'browser':
      case 'device':
      case 'subdivision1':
      case 'subdivision2':
      case 'city':
      case 'country':
        arr.push(`and ${key}=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;

      case 'eventName':
        arr.push(`and event_name=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;

      case 'referrer':
        arr.push(`and referrer_domain=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;

      case 'domain':
        arr.push(`and referrer_domain not like $${params.length + 1}`);
        arr.push(`and referrer_domain not like '/%'`);
        params.push(`%://${filter}/%`);
        break;

      case 'query':
        arr.push(`and url_query=$${params.length + 1}`);
        params.push(decodeURIComponent(filter));
        break;
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
  const {
    domain,
    url,
    eventUrl,
    referrer,
    pageTitle,
    os,
    browser,
    device,
    country,
    subdivision1,
    subdivision2,
    city,
    eventName,
    query,
  } = filters;

  const pageviewFilters = { domain, url, referrer, query, pageTitle };
  const sessionFilters = { os, browser, device, country, subdivision1, subdivision2, city };
  const eventFilters = { url: eventUrl, eventName };

  return {
    pageviewFilters,
    sessionFilters,
    eventFilters,
    event: { eventName },
    joinSession:
      os || browser || device || country || subdivision1 || subdivision2 || city
        ? `inner join session on website_event.${sessionKey} = session.${sessionKey}`
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
  getEventDataFilterQuery,
  toUuid,
  parseFilters,
  rawQuery,
};
