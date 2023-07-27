import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getFunnel(
  ...args: [
    websiteId: string,
    criteria: {
      windowMinutes: number;
      startDate: Date;
      endDate: Date;
      urls: string[];
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
  criteria: {
    windowMinutes: number;
    startDate: Date;
    endDate: Date;
    urls: string[];
  },
): Promise<
  {
    x: string;
    y: number;
    z: number;
  }[]
> {
  const { windowMinutes, startDate, endDate, urls } = criteria;
  const { rawQuery, getFunnelQuery, toUuid } = prisma;
  const { levelQuery, sumQuery, urlParams } = getFunnelQuery(
    urls,
    endDate,
    websiteId,
    windowMinutes,
  );

  const params: any = [websiteId, startDate, endDate, ...urlParams];

  return rawQuery(
    `WITH level1 AS (
      select distinct session_id, created_at
      from website_event
      where website_id = {{websiteId}}${toUuid()}
          and created_at between {{startDate}} and {{endDate}}
          and url_path = $4)
    ${levelQuery}
    ${sumQuery}
    ORDER BY level;`,
    params,
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i]?.count || 0,
      z: (1 - (Number(results[i]?.count) * 1.0) / Number(results[i - 1]?.count)) * 100 || 0, // drop off
    }));
  });
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    windowMinutes: number;
    startDate: Date;
    endDate: Date;
    urls: string[];
  },
): Promise<
  {
    x: string;
    y: number;
    z: number;
  }[]
> {
  const { windowMinutes, startDate, endDate, urls } = criteria;
  const { rawQuery, getFunnelQuery } = clickhouse;
  const { levelQuery, sumQuery, urlFilterQuery, urlParams } = getFunnelQuery(urls, windowMinutes);

  const params = {
    websiteId,
    startDate,
    endDate,
    ...urlParams,
  };

  return rawQuery<{ level: number; count: number }[]>(
    `
    WITH level0 AS (
      select distinct session_id, url_path, referrer_path, created_at
      from umami.website_event
      where url_path in (${urlFilterQuery})
          and website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ), level1 AS (
      select *
      from level0
      where url_path = {url0:String})
    ${levelQuery}
    select *
    from (
    ${sumQuery} 
    ) ORDER BY level;`,
    params,
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i]?.count || 0,
      z: (1 - (Number(results[i]?.count) * 1.0) / Number(results[i - 1]?.count)) * 100 || 0, // drop off
    }));
  });
}
