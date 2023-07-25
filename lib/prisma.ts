import prisma from '@umami/prisma-client';
import moment from 'moment-timezone';
import { MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
import { getDynamicDataType } from './dynamicData';
import { FILTER_COLUMNS } from './constants';

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
    const type = getDynamicDataType(cv.eventValue);

    let value = cv.eventValue;

    ac.push(`and (event_key = $${params.length + 1}`);
    params.push(cv.eventKey);

    switch (type) {
      case 'number':
        ac.push(`and number_value = $${params.length + 1})`);
        params.push(value);
        break;
      case 'string':
        ac.push(`and string_value = $${params.length + 1})`);
        params.push(decodeURIComponent(cv.eventValue as string));
        break;
      case 'boolean':
        ac.push(`and string_value = $${params.length + 1})`);
        params.push(decodeURIComponent(cv.eventValue as string));
        value = cv ? 'true' : 'false';
        break;
      case 'date':
        ac.push(`and date_value = $${params.length + 1})`);
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

    if (filter !== undefined) {
      const column = FILTER_COLUMNS[key] || key;
      arr.push(`and ${column}=$${params.length + 1}`);
      params.push(decodeURIComponent(filter));
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
  const { os, browser, device, country, region, city } = filters;

  return {
    joinSession:
      os || browser || device || country || region || city
        ? `inner join session on website_event.${sessionKey} = session.${sessionKey}`
        : '',
    filterQuery: getFilterQuery(filters, params),
  };
}

function getFunnelParams(endDate: Date, websiteId: string, urls: string[]): any[] {
  const db = getDatabaseType(process.env.DATABASE_URL);

  if (db === POSTGRESQL) {
    return urls;
  }

  if (db === MYSQL) {
    let params = [];
    params.push(urls[0]);
    for (let i = 0; i < urls.length - 1; i++) {
      params = params.concat([urls[i], urls[i + 1], endDate, websiteId]);
    }

    return params;
  }
}

function getFunnelQuery(
  urls: string[],
  endDate: Date,
  websiteId: string,
  windowMinutes: number,
): {
  levelQuery: string;
  sumQuery: string;
  urlParams: any[];
} {
  const initParamLength = 3;

  return urls.reduce(
    (pv, cv, i) => {
      const levelNumber = i + 1;
      const startSum = i > 0 ? 'union ' : '';

      if (levelNumber >= 2) {
        pv.levelQuery += `\n
        , level${levelNumber} AS (
          select distinct we.session_id, we.created_at
          from level${i} l
          join website_event we
              on l.session_id = we.session_id
          where we.created_at between l.created_at 
              and ${getAddMinutesQuery(`l.created_at `, windowMinutes)}
              and we.referrer_path = $${i + initParamLength}
              and we.url_path = $${levelNumber + initParamLength}
              and we.created_at <= $3
              and we.website_id = $1${toUuid()}
        )`;
      }

      pv.sumQuery += `\n${startSum}select ${levelNumber} as level, count(distinct(session_id)) as count from level${levelNumber}`;
      pv.urlParams = getFunnelParams(endDate, websiteId, urls);

      return pv;
    },
    {
      levelQuery: '',
      sumQuery: '',
      urlParams: [],
    },
  );
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
  getAddMinutesQuery,
  getDateQuery,
  getTimestampInterval,
  getFilterQuery,
  getEventDataFilterQuery,
  toUuid,
  parseFilters,
  getFunnelParams,
  getFunnelQuery,
  rawQuery,
};
