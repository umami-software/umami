import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getRetention(
  ...args: [
    websiteId: string,
    criteria: {
      window: string;
      startDate: Date;
      endDate: Date;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    // [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: {
    window: string;
    startDate: Date;
    endDate: Date;
  },
): Promise<
  {
    date: Date;
    visitors: number;
    day: number;
    percentage: number;
  }[]
> {
  const { window, startDate, endDate } = criteria;
  const { rawQuery } = prisma;

  return rawQuery(
    `
    WITH cohort_items AS (
      select
        date_trunc('week', created_at)::date as cohort_date,
        session_id
      from session 
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
      order by 1, 2
    ),
    user_activities AS (
      select distinct
        w.session_id,
        (date_trunc('week', w.created_at)::date - c.cohort_date::date) / 7  as date_number
      from website_event w
      left join cohort_items c
      on w.session_id = c.session_id
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
    ),
    cohort_size as (
      select cohort_date,
        count(*) as visitors
      from cohort_items
      group by 1
      order by 1
    ),
    cohort_date as (
      select
        c.cohort_date,
        a.date_number,
        count(*) as visitors
      from user_activities a
      left join cohort_items c
      on a.session_id = c.session_id
      group by 1, 2
    )
    select
      c.cohort_date,
      c.date_number,
      s.visitors,
      c.visitors,
      c.visitors::float * 100 / s.visitors as percentage
    from cohort_date c
    left join cohort_size s
    on c.cohort_date = s.cohort_date
    where c.cohort_date IS NOT NULL
    order by 1, 2`,
    {
      websiteId,
      startDate,
      endDate,
      window,
    },
  ).then(results => {
    return results;
    // return results.map((a, i) => ({
    //   x: a,
    //   y: results[i]?.count || 0,
    //   z: (1 - Number(results[i]?.count) / Number(results[i - 1]?.count)) * 100 || 0, // drop off
    // }));
  });
}

// async function clickhouseQuery(
//   websiteId: string,
//   criteria: {
//     windowMinutes: number;
//     startDate: Date;
//     endDate: Date;
//     urls: string[];
//   },
// ): Promise<
//   {
//     x: string;
//     y: number;
//     z: number;
//   }[]
// > {
//   const { windowMinutes, startDate, endDate, urls } = criteria;
//   const { rawQuery } = clickhouse;
//   const { levelQuery, sumQuery, urlFilterQuery, urlParams } = getRetentionQuery(
//     urls,
//     windowMinutes,
//   );

//   function getRetentionQuery(
//     urls: string[],
//     windowMinutes: number,
//   ): {
//     levelQuery: string;
//     sumQuery: string;
//     urlFilterQuery: string;
//     urlParams: { [key: string]: string };
//   } {
//     return urls.reduce(
//       (pv, cv, i) => {
//         const levelNumber = i + 1;
//         const startSum = i > 0 ? 'union all ' : '';
//         const startFilter = i > 0 ? ', ' : '';

//         if (levelNumber >= 2) {
//           pv.levelQuery += `\n
//           , level${levelNumber} AS (
//             select distinct y.session_id as session_id,
//                 y.url_path as url_path,
//                 y.referrer_path as referrer_path,
//                 y.created_at as created_at
//             from level${i} x
//             join level0 y
//             on x.session_id = y.session_id
//             where y.created_at between x.created_at and x.created_at + interval ${windowMinutes} minute
//                 and y.referrer_path = {url${i - 1}:String}
//                 and y.url_path = {url${i}:String}
//           )`;
//         }

//         pv.sumQuery += `\n${startSum}select ${levelNumber} as level, count(distinct(session_id)) as count from level${levelNumber}`;
//         pv.urlFilterQuery += `${startFilter}{url${i}:String} `;
//         pv.urlParams[`url${i}`] = cv;

//         return pv;
//       },
//       {
//         levelQuery: '',
//         sumQuery: '',
//         urlFilterQuery: '',
//         urlParams: {},
//       },
//     );
//   }

//   return rawQuery<{ level: number; count: number }[]>(
//     `
//     WITH level0 AS (
//       select distinct session_id, url_path, referrer_path, created_at
//       from umami.website_event
//       where url_path in (${urlFilterQuery})
//         and website_id = {websiteId:UUID}
//         and created_at between {startDate:DateTime64} and {endDate:DateTime64}
//     ),
//     level1 AS (
//       select *
//       from level0
//       where url_path = {url0:String}
//     )
//     ${levelQuery}
//     select *
//     from (
//       ${sumQuery}
//     ) ORDER BY level;
//     `,
//     {
//       websiteId,
//       startDate,
//       endDate,
//       ...urlParams,
//     },
//   ).then(results => {
//     return urls.map((a, i) => ({
//       x: a,
//       y: results[i]?.count || 0,
//       z: (1 - Number(results[i]?.count) / Number(results[i - 1]?.count)) * 100 || 0, // drop off
//     }));
//   });
// }
