import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getUTM(
  ...args: [
    websiteId: string,
    filters: {
      startDate: Date;
      endDate: Date;
      timezone?: string;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
  },
): Promise<
  {
    date: string;
    day: number;
    visitors: number;
    returnVisitors: number;
    percentage: number;
  }[]
> {
  const { startDate, endDate } = filters;
  const { rawQuery } = prisma;

  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and url_query is not null
    group by 1
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  ).then(results => {
    return results;
  });
}

async function clickhouseQuery(
  websiteId: string,
  filters: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
  },
): Promise<
  {
    date: string;
    day: number;
    visitors: number;
    returnVisitors: number;
    percentage: number;
  }[]
> {
  const { startDate, endDate } = filters;
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and url_query != ''
    group by 1
    `,
    {
      websiteId,
      startDate,
      endDate,
    },
  ).then(result => parseParameters(result as any[]));
}

function parseParameters(result: any[]) {
  return Object.values(result).reduce((data, { url_query, num }) => {
    const params = url_query.split('&').map(n => decodeURIComponent(n));

    for (const param of params) {
      const [key, value] = param.split('=');

      const match = key.match(/^utm_(\w+)$/);

      if (match) {
        const group = match[1];
        const name = decodeURIComponent(value);

        if (!data[group]) {
          data[group] = { [name]: +num };
        } else if (!data[group][name]) {
          data[group][name] = +num;
        } else {
          data[group][name] += +num;
        }
      }
    }

    return data;
  }, {});
}
