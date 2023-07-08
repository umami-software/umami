import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import { WebsiteEventDataMetric } from 'lib/types';
import { loadWebsite } from 'lib/query';
import { DEFAULT_CREATED_AT } from 'lib/constants';

export interface EventDataCriteria {
  fields: [{ name: string; type: string; value: string }];
  filters: [
    {
      name: string;
      type: string;
      value: [string, string];
    },
  ];
  groups: [
    {
      name: string;
      type: string;
    },
  ];
}

export async function getEventData(
  ...args: [websiteId: string, startDate: Date, endDate: Date, criteria: EventDataCriteria]
): Promise<WebsiteEventDataMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery() {
  return null;
}

async function clickhouseQuery(
  websiteId: string,
  startDate: Date,
  endDate: Date,
  criteria: EventDataCriteria,
) {
  const { fields, filters } = criteria;
  const { rawQuery, getDateFormat, getBetweenDates } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);

  const uniqueFields = fields.reduce((obj, { name, type, value }) => {
    const prefix = type === 'array' ? 'string' : type;

    if (!obj[name]) {
      obj[name] = {
        columns: [
          'event_key as field',
          `count(*) as total`,
          value === 'unique' ? `${prefix}_value as value` : null,
        ].filter(n => n),
        groups: ['event_key', value === 'unique' ? `${prefix}_value` : null].filter(n => n),
      };
    }
    return obj;
  }, {});

  const queries = Object.keys(uniqueFields).reduce((arr, key) => {
    const field = uniqueFields[key];
    const params = { websiteId, name: key };

    return arr.concat(
      rawQuery(
        `select
             ${field.columns.join(',')}
        from event_data
        where website_id = {websiteId:UUID}
          and event_key = {name:String}
          and created_at >= ${getDateFormat(resetDate)}
          and ${getBetweenDates('created_at', startDate, endDate)}
        group by ${field.groups.join(',')}
        limit 100
    `,
        params,
      ),
    );
  }, []);

  const results = (await Promise.all(queries)).flatMap(n => n);

  const columns = results.reduce((arr, row) => {
    const keys = Object.keys(row);
    for (const key of keys) {
      if (!arr.includes(key)) {
        arr.push(key);
      }
    }
    return arr;
  }, []);

  return results.reduce((arr, row) => {
    return arr.concat(
      columns.reduce((obj, key) => {
        obj[key] = row[key];
        return obj;
      }, {}),
    );
  }, []);
}
