import prisma from '@umami/prisma-client';
import moment from 'moment-timezone';
import { MYSQL, POSTGRESQL, getDatabaseType } from 'lib/db';
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

function getAddMinutesQuery(field: string, minutes: number) {
  const db = getDatabaseType();

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
                  and website_id = $1
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

async function rawQuery(sql: string, data: object): Promise<any> {
  const db = getDatabaseType();
  const params = [];

  if (db !== POSTGRESQL && db !== MYSQL) {
    return Promise.reject(new Error('Unknown database.'));
  }

  const query = sql?.replaceAll(/\{\{(\w+)(::\w+)?}}/g, (...args) => {
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
  getFunnelQuery,
  parseFilters,
  rawQuery,
};
