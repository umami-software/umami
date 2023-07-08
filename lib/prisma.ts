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

function getAddMinutesQuery(field: string, minutes: number) {
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

function getFunnelQuery(
  urls: string[],
  windowMinutes: number,
): {
  levelQuery: string;
  sumQuery: string;
  urlFilterQuery: string;
} {
  const initParamLength = 3;

  return urls.reduce(
    (pv, cv, i) => {
      const levelNumber = i + 1;
      const start = i > 0 ? ',' : '';

      if (levelNumber >= 2) {
        pv.levelQuery += `\n
        , level${levelNumber} AS (
          select cl.*,
            l0.created_at level_${levelNumber}_created_at,
            l0.url_path as level_${levelNumber}_url
          from level${i} cl
              left join website_event l0
                  on cl.session_id = l0.session_id
                  and l0.created_at between cl.level_${i}_created_at 
                    and ${getAddMinutesQuery(`cl.level_${i}_created_at`, windowMinutes)}
                  and l0.referrer_path = $${i + initParamLength}
                  and l0.url_path = $${levelNumber + initParamLength}
                  and created_at between $2 and $3
                  and website_id = $1${toUuid()}
        )`;
      }

      pv.sumQuery += `\n${start}SUM(CASE WHEN level_${levelNumber}_url is not null THEN 1 ELSE 0 END) AS level${levelNumber}`;

      pv.urlFilterQuery += `\n${start}$${levelNumber + initParamLength} `;

      return pv;
    },
    {
      levelQuery: '',
      sumQuery: '',
      urlFilterQuery: '',
    },
  );
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
  getFunnelQuery,
  getEventDataFilterQuery,
  toUuid,
  parseFilters,
  rawQuery,
};
