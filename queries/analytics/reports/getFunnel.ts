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
  const { rawQuery, getAddMinutesQuery } = prisma;
  const { levelQuery, sumQuery } = getFunnelQuery(urls, windowMinutes);

  function getFunnelQuery(
    urls: string[],
    windowMinutes: number,
  ): {
    levelQuery: string;
    sumQuery: string;
  } {
    return urls.reduce(
      (pv, cv, i) => {
        const levelNumber = i + 1;
        const startSum = i > 0 ? 'union ' : '';

        if (levelNumber >= 2) {
          pv.levelQuery += `
          , level${levelNumber} AS (
            select distinct we.session_id, we.created_at
            from level${i} l
            join website_event we
                on l.session_id = we.session_id
            where we.created_at between l.created_at 
                and ${getAddMinutesQuery(`l.created_at `, windowMinutes)}
                and we.referrer_path = {{${i - 1}}}
                and we.url_path = {{${i}}}
                and we.created_at <= {{endDate}}
                and we.website_id = {{websiteId::uuid}}
          )`;
        }

        pv.sumQuery += `\n${startSum}select ${levelNumber} as level, count(distinct(session_id)) as count from level${levelNumber}`;

        return pv;
      },
      {
        levelQuery: '',
        sumQuery: '',
      },
    );
  }

  return rawQuery(
    `
    WITH level1 AS (
      select distinct session_id, created_at
      from website_event
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
        and url_path = {{0}}
    )
    ${levelQuery}
    ${sumQuery}
    ORDER BY level;
    `,
    {
      websiteId,
      startDate,
      endDate,
      ...urls,
    },
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i]?.count || 0,
      z: (1 - Number(results[i]?.count) / Number(results[i - 1]?.count)) * 100 || 0, // drop off
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
  const { rawQuery } = clickhouse;
  const { levelQuery, sumQuery, urlFilterQuery, urlParams } = getFunnelQuery(urls, windowMinutes);

  function getFunnelQuery(
    urls: string[],
    windowMinutes: number,
  ): {
    levelQuery: string;
    sumQuery: string;
    urlFilterQuery: string;
    urlParams: { [key: string]: string };
  } {
    return urls.reduce(
      (pv, cv, i) => {
        const levelNumber = i + 1;
        const startSum = i > 0 ? 'union all ' : '';
        const startFilter = i > 0 ? ', ' : '';

        if (levelNumber >= 2) {
          pv.levelQuery += `\n
          , level${levelNumber} AS (
            select distinct y.session_id as session_id,
                y.url_path as url_path,
                y.referrer_path as referrer_path,
                y.created_at as created_at
            from level${i} x
            join level0 y
            on x.session_id = y.session_id
            where y.created_at between x.created_at and x.created_at + interval ${windowMinutes} minute
                and y.referrer_path = {url${i - 1}:String}
                and y.url_path = {url${i}:String}
          )`;
        }

        pv.sumQuery += `\n${startSum}select ${levelNumber} as level, count(distinct(session_id)) as count from level${levelNumber}`;
        pv.urlFilterQuery += `${startFilter}{url${i}:String} `;
        pv.urlParams[`url${i}`] = cv;

        return pv;
      },
      {
        levelQuery: '',
        sumQuery: '',
        urlFilterQuery: '',
        urlParams: {},
      },
    );
  }

  return rawQuery<{ level: number; count: number }[]>(
    `
    WITH level0 AS (
      select distinct session_id, url_path, referrer_path, created_at
      from umami.website_event
      where url_path in (${urlFilterQuery})
        and website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ),
    level1 AS (
      select *
      from level0
      where url_path = {url0:String}
    )
    ${levelQuery}
    select *
    from (
      ${sumQuery} 
    ) ORDER BY level;
    `,
    {
      websiteId,
      startDate,
      endDate,
      ...urlParams,
    },
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i]?.count || 0,
      z: (1 - Number(results[i]?.count) / Number(results[i - 1]?.count)) * 100 || 0, // drop off
    }));
  });
}
