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
  }[]
> {
  const { windowMinutes, startDate, endDate, urls } = criteria;
  const { rawQuery, getFunnelQuery } = prisma;
  const { levelQuery, sumQuery, urlFilterQuery } = getFunnelQuery(urls, windowMinutes);

  return rawQuery(
    `WITH level0 AS (
      select distinct session_id, url_path, referrer_path, created_at
      from website_event
      where url_path in (${urlFilterQuery})
          and website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
  ),level1 AS (
      select distinct session_id, url_path as level_1_url, created_at as level_1_created_at
      from level0
      where url_path = $4
  )${levelQuery}
  
  SELECT ${sumQuery}
  from level${urls.length};
  `,
    { websiteId, startDate, endDate, ...urls },
  ).then((a: { [key: string]: number }) => {
    return urls.map((b, i) => ({ x: b, y: a[0][`level${i + 1}`] || 0 }));
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
  const { rawQuery, getFunnelQuery } = clickhouse;
  const { columnsQuery, urlParams } = getFunnelQuery(urls);

  return rawQuery<{ level: number; count: number }[]>(
    `
    SELECT level,
        count(*) AS count
    FROM (
    SELECT session_id,
            windowFunnel({window:UInt32}, 'strict_increase')
            (
                created_at
                ${columnsQuery}
            ) AS level
        FROM website_event
        WHERE website_id = {websiteId:UUID}
        AND created_at BETWEEN {startDate:DateTime} AND {endDate:DateTime}       
        GROUP BY 1
        )
    GROUP BY level
    ORDER BY level ASC;
    `,
    {
      websiteId,
      startDate,
      endDate,
      window: windowMinutes * 60,
      ...urlParams,
    },
  ).then(results => {
    return urls.map((a, i) => ({
      x: a,
      y: results[i + 1]?.count || 0,
    }));
  });
}
