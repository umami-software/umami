import clickhouse from '@/lib/clickhouse';
import { FILTER_COLUMNS, FUNNEL_BREAKDOWN_FIELDS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { getWildcardMatch } from '@/lib/search';
import type { QueryFilters } from '@/lib/types';

export interface FunnelStepFilter {
  property: string;
  operator: string;
  value: string;
}

export interface FunnelStep {
  type: string;
  value: string;
  filters?: Array<FunnelStepFilter>;
}

export interface FunnelParameters {
  startDate: Date;
  endDate: Date;
  window: number;
  steps: Array<FunnelStep>;
}

export interface FunnelResult extends FunnelStep {
  visitors: number;
  previous: number;
  dropped: number;
  dropoff: number;
  remaining: number;
}

export interface FunnelChartParameters extends FunnelParameters {
  unit?: string;
  timezone?: string;
}

export interface FunnelChartData {
  t: string;
  entered: number;
  converted: number;
}

export interface FunnelTimesData {
  total: number | null;
  steps: Array<number | null>;
}

export interface FunnelBreakdownParameters extends FunnelParameters {
  field: string;
}

export interface FunnelBreakdownData {
  name: string;
  visitors: number[];
}

// The select after the level CTEs, so every funnel view shares the same step matching.
type FinalQuery = (levelCount: number) => string;

const FUNNEL_BREAKDOWN_LIMIT = 10;

const levelNumbers = (levelCount: number) => Array.from({ length: levelCount }, (_, i) => i + 1);

const stepCountsQuery = (levelCount: number, union: string) =>
  levelNumbers(levelCount)
    .map(n => `select ${n} as level, count(distinct(session_id)) as count from level${n}`)
    .join(`\n${union} `);

export async function getFunnel(
  ...args: [websiteId: string, parameters: FunnelParameters, filters: QueryFilters]
): Promise<FunnelResult[]> {
  const [websiteId, parameters, filters] = args;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        websiteId,
        parameters,
        filters,
        levelCount => `${stepCountsQuery(levelCount, 'union')}\n    ORDER BY level;`,
      ),
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        websiteId,
        parameters,
        filters,
        levelCount =>
          `select *\n    from (\n      ${stepCountsQuery(levelCount, 'union all')}\n    ) ORDER BY level;`,
      ),
  }).then(formatResults(parameters.steps));
}

// Sessions are bucketed by when they entered the funnel; converted means reaching the last step.
export async function getFunnelChart(
  ...args: [websiteId: string, parameters: FunnelChartParameters, filters: QueryFilters]
): Promise<FunnelChartData[]> {
  const [websiteId, parameters, filters] = args;
  const { unit = 'day', timezone = 'utc' } = parameters;

  const chartQuery =
    (dateQuery: string, countIf: (condition: string) => string): FinalQuery =>
    levelCount =>
      `
    , starts AS (
      select session_id, min(created_at) as first_at
      from level1
      group by session_id
    )
    select ${dateQuery} as t,
      count(*) as entered,
      ${countIf(`session_id in (select session_id from level${levelCount})`)} as converted
    from starts
    group by t
    order by t;`;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        websiteId,
        parameters,
        filters,
        chartQuery(
          prisma.getDateSQL('first_at', unit, timezone),
          condition => `sum(case when ${condition} then 1 else 0 end)`,
        ),
      ),
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        websiteId,
        parameters,
        filters,
        chartQuery(
          clickhouse.getDateSQL('first_at', unit, timezone),
          condition => `countIf(${condition})`,
        ),
      ),
  }).then((rows: any[]) =>
    rows.map(({ t, entered, converted }) => ({
      t,
      entered: Number(entered) || 0,
      converted: Number(converted) || 0,
    })),
  );
}

// Lower median of whole seconds from first reaching the previous step to first reaching each step.
export async function getFunnelTimes(
  ...args: [websiteId: string, parameters: FunnelParameters, filters: QueryFilters]
): Promise<FunnelTimesData> {
  const [websiteId, parameters, filters] = args;
  const levelCount = parameters.steps.length;
  // Level 0 is the whole funnel, from step 1 to the last step.
  const pairs = [
    ...levelNumbers(levelCount)
      .slice(1)
      .map(n => [n, n - 1, n]),
    [0, 1, levelCount],
  ];

  const timesQuery =
    (median: string): FinalQuery =>
    () =>
      `${levelNumbers(levelCount)
        .map(
          n => `
    , reached${n} AS (
      select session_id, min(created_at) as first_at
      from level${n}
      group by session_id
    )`,
        )
        .join('')}
    ${pairs
      .map(
        ([level, from, to]) => `select ${level} as level,
      count(*) as sessions,
      ${median} as median
    from reached${to} b
    join reached${from} a on a.session_id = b.session_id`,
      )
      .join('\n    union all\n    ')};`;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        websiteId,
        parameters,
        filters,
        timesQuery(
          'percentile_disc(0.5) within group (order by floor(extract(epoch from (b.first_at - a.first_at))))',
        ),
      ),
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        websiteId,
        parameters,
        filters,
        timesQuery("quantileExactLow(0.5)(dateDiff('second', a.first_at, b.first_at))"),
      ),
  }).then((rows: any[]) => {
    const medianOf = (level: number) => {
      const row = rows.find(r => Number(r.level) === level);
      return row && Number(row.sessions) > 0 ? Number(row.median) : null;
    };

    return {
      total: medianOf(0),
      steps: levelNumbers(levelCount).map(n => (n > 1 ? medianOf(n) : null)),
    };
  });
}

// Visitors at each step split by a session attribute, for its most common values at step 1.
export async function getFunnelBreakdown(
  ...args: [websiteId: string, parameters: FunnelBreakdownParameters, filters: QueryFilters]
): Promise<FunnelBreakdownData[]> {
  const [websiteId, parameters, filters] = args;
  const levelCount = parameters.steps.length;

  if (!(FUNNEL_BREAKDOWN_FIELDS as readonly string[]).includes(parameters.field)) {
    throw new Error(`Unsupported funnel breakdown field: ${parameters.field}`);
  }

  const column = FILTER_COLUMNS[parameters.field];

  const breakdownQuery =
    (dimsQuery: string): FinalQuery =>
    () =>
      `
    , dims AS (${dimsQuery}
    )
    , top_dims AS (
      select name from dims group by name order by count(*) desc, name limit ${FUNNEL_BREAKDOWN_LIMIT}
    )
    select l.level as level, d.name as name, count(distinct l.session_id) as count
    from (${levelNumbers(levelCount)
      .map(n => `select ${n} as level, session_id from level${n}`)
      .join('\n      union all ')}) l
    join dims d on d.session_id = l.session_id
    where d.name in (select name from top_dims)
    group by l.level, d.name;`;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        websiteId,
        parameters,
        filters,
        breakdownQuery(`
      select starts.session_id, coalesce(session.${column}, '') as name
      from (select distinct session_id from level1) starts
      join session on session.session_id = starts.session_id
        and session.website_id = {{websiteId::uuid}}`),
      ),
    // Attributes can differ between a session's events, so take the first event's value.
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        websiteId,
        parameters,
        filters,
        breakdownQuery(`
      select session_id, argMin(${column}, created_at) as name
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and session_id in (select session_id from level1)
      group by session_id`),
      ),
  }).then((rows: any[]) => {
    const byName = new Map<string, number[]>();

    for (const { level, name, count } of rows) {
      const visitors = byName.get(name) ?? Array(levelCount).fill(0);
      visitors[Number(level) - 1] = Number(count) || 0;
      byName.set(name, visitors);
    }

    return [...byName.entries()]
      .map(([name, visitors]) => ({ name, visitors }))
      .sort((a, b) => b.visitors[0] - a.visitors[0] || a.name.localeCompare(b.name));
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: FunnelParameters,
  filters: QueryFilters,
  finalQuery: FinalQuery,
): Promise<any[]> {
  const { startDate, endDate, window, steps } = parameters;
  const { rawQuery, getAddIntervalQuery, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });
  const { levelOneQuery, levelQuery, params } = getFunnelQuery(steps, window);

  function buildExistsFilters(
    stepIndex: number,
    stepFilters: Array<FunnelStepFilter> | undefined,
    eventAlias: string,
    extraParams: Record<string, string>,
  ): string {
    if (!stepFilters?.length) return '';

    return stepFilters
      .map((f, fi) => {
        const keyParam = `f_${stepIndex}_${fi}_k`;
        const valParam = `f_${stepIndex}_${fi}_v`;
        extraParams[keyParam] = f.property;

        let op = '=';
        let val = f.value;
        if (f.operator === 'neq') op = '!=';
        else if (f.operator === 'c') {
          op = 'ilike';
          val = `%${val}%`;
        } else if (f.operator === 'dnc') {
          op = 'not ilike';
          val = `%${val}%`;
        }
        extraParams[valParam] = val;

        return `and exists (
          select 1 from event_data _ed${stepIndex}_${fi}
          where _ed${stepIndex}_${fi}.website_event_id = ${eventAlias}.event_id
            and _ed${stepIndex}_${fi}.website_id = {{websiteId::uuid}}
            and _ed${stepIndex}_${fi}.created_at between {{startDate}} and {{endDate}}
            and _ed${stepIndex}_${fi}.data_key = {{${keyParam}}}
            and case when _ed${stepIndex}_${fi}.data_type = 2 then replace(_ed${stepIndex}_${fi}.string_value, '.0000', '') else _ed${stepIndex}_${fi}.string_value end ${op} {{${valParam}}}
        )`;
      })
      .join('\n');
  }

  function getFunnelQuery(
    steps: Array<FunnelStep>,
    window: number,
  ): {
    levelOneQuery: string;
    levelQuery: string;
    params: Record<string, string>;
  } {
    const extraParams: Record<string, string> = {};

    const result = steps.reduce(
      (pv, cv, i) => {
        const levelNumber = i + 1;
        const isURL = cv.type === 'path';
        const column = isURL ? 'url_path' : 'event_name';

        const { operator, value: paramValue } = getWildcardMatch(cv.value);

        const existsClause =
          !isURL && cv.filters?.length
            ? buildExistsFilters(
                i,
                cv.filters,
                levelNumber === 1 ? 'website_event' : 'we',
                extraParams,
              )
            : '';

        if (levelNumber === 1) {
          pv.levelOneQuery = `
          WITH level1 AS (
            select distinct website_event.session_id, website_event.created_at
            from website_event
            ${cohortQuery}
            ${joinSessionQuery}
            where website_event.website_id = {{websiteId::uuid}}
              and website_event.created_at between {{startDate}} and {{endDate}}
              and ${column} ${operator} {{${i}}}
              ${filterQuery}
              ${existsClause}
          )`;
        } else {
          pv.levelQuery += `
          , level${levelNumber} AS (
            select distinct we.session_id, we.created_at
            from level${i} l
            join website_event we
                on l.session_id = we.session_id
            where we.website_id = {{websiteId::uuid}}
                and we.created_at between l.created_at and ${getAddIntervalQuery(
                  `l.created_at `,
                  `${window} minute`,
                )}
                and we.${column} ${operator} {{${i}}}
                and we.created_at >= {{startDate}}
                and we.created_at <= {{endDate}}
                ${existsClause}
          )`;
        }

        pv.params[i] = paramValue;

        return pv;
      },
      {
        levelOneQuery: '',
        levelQuery: '',
        params: {} as Record<string, string>,
      },
    );

    return { ...result, params: { ...result.params, ...extraParams } };
  }

  return rawQuery(
    `
    ${levelOneQuery}
    ${levelQuery}
    ${finalQuery(steps.length)}
    `,
    {
      ...params,
      ...queryParams,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: FunnelParameters,
  filters: QueryFilters,
  finalQuery: FinalQuery,
): Promise<any[]> {
  const { startDate, endDate, window, steps } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const { levelOneQuery, levelQuery, stepFilterQuery, params } = getFunnelQuery(steps, window);
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  function buildEventDataFilters(
    stepIndex: number,
    stepFilters: Array<FunnelStepFilter> | undefined,
    params: Record<string, string>,
    eventAlias: string,
  ): string {
    if (!stepFilters?.length) return '';

    return stepFilters
      .map((f, fi) => {
        const keyParam = `f_${stepIndex}_${fi}_k`;
        const valParam = `f_${stepIndex}_${fi}_v`;
        params[keyParam] = f.property;

        let op = '=';
        let val = f.value;
        if (f.operator === 'neq') op = '!=';
        else if (f.operator === 'c') {
          op = 'like';
          val = `%${val}%`;
        } else if (f.operator === 'dnc') {
          op = 'not like';
          val = `%${val}%`;
        }
        params[valParam] = val;

        return `and ${eventAlias}.event_id in (
          select event_id from event_data
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and data_key = {${keyParam}:String}
            and multiIf(data_type = 2, replaceAll(string_value, '.0000', ''), string_value) ${op} {${valParam}:String}
        )`;
      })
      .join('\n');
  }

  function getFunnelQuery(
    steps: Array<FunnelStep>,
    window: number,
  ): {
    levelOneQuery: string;
    levelQuery: string;
    stepFilterQuery: string;
    params: Record<string, string>;
  } {
    const extraParams: Record<string, string> = {};

    const result = steps.reduce(
      (pv, cv, i) => {
        const levelNumber = i + 1;
        const startFilter = i > 0 ? 'or' : '';
        const isURL = cv.type === 'path';
        const column = isURL ? 'url_path' : 'event_name';

        const { operator, value: paramValue } = getWildcardMatch(cv.value);

        const eventAlias = levelNumber === 1 ? 'level0' : 'y';
        const eventDataClause =
          !isURL && cv.filters?.length
            ? buildEventDataFilters(i, cv.filters, extraParams, eventAlias)
            : '';

        if (levelNumber === 1) {
          pv.levelOneQuery = `\n
          level1 AS (
            select *
            from level0
            where ${column} ${operator} {param${i}:String}
            ${eventDataClause}
          )`;
        } else {
          pv.levelQuery += `\n
          , level${levelNumber} AS (
            select distinct y.session_id as session_id,
                y.url_path as url_path,
                y.referrer_path as referrer_path,
                y.event_name as event_name,
                y.event_id as event_id,
                y.created_at as created_at
            from level${i} x
            join level0 y
            on x.session_id = y.session_id
            where y.created_at between x.created_at and x.created_at + interval ${window} minute
                and y.${column} ${operator} {param${i}:String}
                ${eventDataClause}
          )`;
        }

        pv.stepFilterQuery += `${startFilter} ${column} ${operator} {param${i}:String} `;
        pv.params[`param${i}`] = paramValue;

        return pv;
      },
      {
        levelOneQuery: '',
        levelQuery: '',
        stepFilterQuery: '',
        params: {} as Record<string, string>,
      },
    );

    return { ...result, params: { ...result.params, ...extraParams } };
  }

  return rawQuery(
    `
    WITH level0 AS (
      select distinct event_id, session_id, url_path, referrer_path, event_name, created_at
      from website_event
      ${cohortQuery}
      where (${stepFilterQuery})
        and website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
       ${filterQuery}
    ),
    ${levelOneQuery}
    ${levelQuery}
    ${finalQuery(steps.length)}
    `,
    {
      ...params,
      ...queryParams,
    },
  );
}

const formatResults = (steps: Array<FunnelStep>) => (results: unknown) => {
  return steps.map((step: FunnelStep, i: number) => {
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
