import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getPageviewFunnel(
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
  const { rawQuery, getFunnelQuery, toUuid, getDropoffQuery } = prisma;
  const { levelQuery, sumQuery, urlFilterQuery } = getFunnelQuery(urls, windowMinutes);

  const params: any = [websiteId, startDate, endDate, ...urls];

  return rawQuery(
    `WITH level0 AS (
      select distinct session_id, url_path, referrer_path, created_at
      from website_event
      where url_path in (${urlFilterQuery})
          and website_id = $1${toUuid()}
          and created_at between $2 and $3
  ),level1 AS (
      select distinct session_id, created_at
      from level0
      where url_path = $4
  )${levelQuery}, levelCount as (
      ${sumQuery}
      order by level)
    select
      level,
      count,
      ${getDropoffQuery()} as drop_off
    from levelCount;
    `,
    params,
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i]?.count || 0,
      z: results[i]?.drop_off || 0,
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
  }[]
> {
  const { windowMinutes, startDate, endDate, urls } = criteria;
  const { rawQuery, getBetweenDates, getFunnelQuery } = clickhouse;
  const { columnsQuery, urlParams } = getFunnelQuery(urls);

  const params = {
    websiteId,
    window: windowMinutes * 60,
    ...urlParams,
  };

  return rawQuery<{ level: number; count: number }[]>(
    `
    select level,
        count(*) AS count
    from (
    select session_id,
            windowFunnel({window:UInt32}, 'strict_increase')
            (
                created_at
                ${columnsQuery}
            ) AS level
        from website_event
        where website_id = {websiteId:UUID}
            and ${getBetweenDates('created_at', startDate, endDate)}             
        group by 1
        )
    group by level
    order by level asc;
    `,
    params,
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i + 1]?.count || 0,
    }));
  });
}
