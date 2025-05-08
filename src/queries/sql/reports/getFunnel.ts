import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

const formatResults = (steps: { type: string; value: string }[]) => (results: unknown) => {
  return steps.map((step: { type: string; value: string }, i: number) => {
    const visitors = Number(results[i]?.count) || 0;
    const previous = Number(results[i - 1]?.count) || 0;
    const dropped = previous > 0 ? previous - visitors : 0;
    const dropoff = 1 - visitors / previous;
    const remaining = visitors / Number(results[0].count);

    return {
      ...step,
      visitors,
      previous,
      dropped,
      dropoff,
      remaining,
    };
  });
};

export async function getFunnel(
  ...args: [
    websiteId: string,
    criteria: {
      windowMinutes: number;
      startDate: Date;
      endDate: Date;
      steps: { type: string; value: string }[];
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
    steps: { type: string; value: string }[];
  },
): Promise<
  {
    value: string;
    visitors: number;
    dropoff: number;
  }[]
> {
  const { windowMinutes, startDate, endDate, steps } = criteria;
  const { rawQuery, getAddIntervalQuery } = prisma;
  const { levelOneQuery, levelQuery, sumQuery, params } = getFunnelQuery(steps, windowMinutes);

  function getFunnelQuery(
    steps: { type: string; value: string }[],
    windowMinutes: number,
  ): {
    levelOneQuery: string;
    levelQuery: string;
    sumQuery: string;
    params: string[];
  } {
    return steps.reduce(
      (pv, cv, i) => {
        const levelNumber = i + 1;
        const startSum = i > 0 ? 'union ' : '';
        let column;
        switch (cv.type) {
          case 'url':
            column = 'url_path';
            break;
          case 'event':
            column = 'event_name';
            break;
          case 'hosts':
            column = 'hostname';
            break;
        }

        let operator = '=';
        let paramValue = cv.value;

        if (cv.value.startsWith('*') || cv.value.endsWith('*')) {
          operator = 'like';
          paramValue = cv.value.replace(/^\*|\*$/g, '%');
        }

        if (levelNumber === 1) {
          pv.levelOneQuery = `
          WITH level1 AS (
            select distinct we.website_id, we.session_id, we.created_at, we.url_path, we.event_name, s.hostname
            from website_event we
            join session s
                on we.session_id = s.session_id
            where we.website_id = {{websiteId::uuid}}
              and we.created_at between {{startDate}} and {{endDate}}
              and ${column} ${operator} {{${i}}}
          )`;
        } else {
          pv.levelQuery += `
          , level${levelNumber} AS (
            select distinct l.website_id, l.session_id, l.created_at, l.url_path, l.event_name, l.hostname
            from level${i} l
            where l.website_id = {{websiteId::uuid}}
                and l.created_at between l.created_at and ${getAddIntervalQuery(
                  `l.created_at `,
                  `${windowMinutes} minute`,
                )}
                and l.${column} ${operator} {{${i}}}
                and l.created_at <= {{endDate}}
          )`;
        }

        pv.sumQuery += `\n${startSum}select ${levelNumber} as level, count(distinct(session_id)) as count from level${levelNumber}`;
        pv.params.push(paramValue);

        return pv;
      },
      {
        levelOneQuery: '',
        levelQuery: '',
        sumQuery: '',
        params: [],
      },
    );
  }

  return rawQuery(
    `
    ${levelOneQuery}
    ${levelQuery}
    ${sumQuery}
    ORDER BY level;
    `,
    {
      websiteId,
      startDate,
      endDate,
      ...params,
    },
  ).then(formatResults(steps));
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    windowMinutes: number;
    startDate: Date;
    endDate: Date;
    steps: { type: string; value: string }[];
  },
): Promise<
  {
    value: string;
    visitors: number;
    dropoff: number;
  }[]
> {
  const { windowMinutes, startDate, endDate, steps } = criteria;
  const { rawQuery } = clickhouse;
  const { levelOneQuery, levelQuery, sumQuery, stepFilterQuery, params } = getFunnelQuery(
    steps,
    windowMinutes,
  );

  function getFunnelQuery(
    steps: { type: string; value: string }[],
    windowMinutes: number,
  ): {
    levelOneQuery: string;
    levelQuery: string;
    sumQuery: string;
    stepFilterQuery: string;
    params: { [key: string]: string };
  } {
    return steps.reduce(
      (pv, cv, i) => {
        const levelNumber = i + 1;
        const startSum = i > 0 ? 'union all ' : '';
        const startFilter = i > 0 ? 'or' : '';
        const isURL = cv.type === 'url';
        const column = isURL ? 'url_path' : 'event_name';

        let operator = '=';
        let paramValue = cv.value;

        if (cv.value.startsWith('*') || cv.value.endsWith('*')) {
          operator = 'like';
          paramValue = cv.value.replace(/^\*|\*$/g, '%');
        }

        if (levelNumber === 1) {
          pv.levelOneQuery = `\n
          level1 AS (
            select *
            from level0
            where ${column} ${operator} {param${i}:String}
          )`;
        } else {
          pv.levelQuery += `\n
          , level${levelNumber} AS (
            select distinct y.session_id as session_id,
                y.url_path as url_path,
                y.referrer_path as referrer_path,
                y.event_name,
                y.created_at as created_at
            from level${i} x
            join level0 y
            on x.session_id = y.session_id
            where y.created_at between x.created_at and x.created_at + interval ${windowMinutes} minute
                and y.${column} ${operator} {param${i}:String}
          )`;
        }

        pv.sumQuery += `\n${startSum}select ${levelNumber} as level, count(distinct(session_id)) as count from level${levelNumber}`;
        pv.stepFilterQuery += `${startFilter} ${column} ${operator} {param${i}:String} `;
        pv.params[`param${i}`] = paramValue;

        return pv;
      },
      {
        levelOneQuery: '',
        levelQuery: '',
        sumQuery: '',
        stepFilterQuery: '',
        params: {},
      },
    );
  }

  return rawQuery(
    `
    WITH level0 AS (
      select distinct session_id, url_path, referrer_path, event_name, created_at
      from umami.website_event
      where (${stepFilterQuery})
        and website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ),
    ${levelOneQuery}
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
      ...params,
    },
  ).then(formatResults(steps));
}
