import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

interface JourneyResult {
  e1: string;
  e2: string;
  e3: string;
  e4: string;
  e5: string;
  e6: string;
  e7: string;
  count: number;
}

export async function getJourney(
  ...args: [
    websiteId: string,
    filters: {
      startDate: Date;
      endDate: Date;
      steps: number;
      startStep?: string;
      endStep?: string;
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
    steps: number;
    startStep?: string;
    endStep?: string;
  },
): Promise<JourneyResult[]> {
  const { startDate, endDate, steps, startStep, endStep } = filters;
  const { rawQuery } = prisma;
  const { sequenceQuery, startStepQuery, endStepQuery, params } = getJourneyQuery(
    steps,
    startStep,
    endStep,
  );

  function getJourneyQuery(
    steps: number,
    startStep?: string,
    endStep?: string,
  ): {
    sequenceQuery: string;
    startStepQuery: string;
    endStepQuery: string;
    params: { [key: string]: string };
  } {
    const params = {};
    let sequenceQuery = '';
    let startStepQuery = '';
    let endStepQuery = '';

    // create sequence query
    let selectQuery = '';
    let maxQuery = '';
    let groupByQuery = '';

    for (let i = 1; i <= steps; i++) {
      const endQuery = i < steps ? ',' : '';
      selectQuery += `s.e${i},`;
      maxQuery += `\nmax(CASE WHEN event_number = ${i} THEN event ELSE NULL END) AS e${i}${endQuery}`;
      groupByQuery += `s.e${i}${endQuery} `;
    }

    sequenceQuery = `\nsequences as (
          select ${selectQuery}
          count(*) count
      FROM (
        select visit_id,
            ${maxQuery}
        FROM events
        group by visit_id) s
      group by ${groupByQuery})
    `;

    // create start Step params query
    if (startStep) {
      startStepQuery = `and e1 = {{startStep}}`;
      params['startStep'] = startStep;
    }

    // create end Step params query
    if (endStep) {
      for (let i = 1; i < steps; i++) {
        const startQuery = i === 1 ? 'and (' : '\nor ';
        endStepQuery += `${startQuery}(e${i} = {{endStep}} and e${i + 1} is null) `;
      }
      endStepQuery += `\nor (e${steps} = {{endStep}}))`;

      params['endStep'] = endStep;
    }

    return {
      sequenceQuery,
      startStepQuery,
      endStepQuery,
      params,
    };
  }

  return rawQuery(
    `
    WITH events AS (
      select distinct
          visit_id,
          referrer_path,
          coalesce(nullIf(event_name, ''), url_path) event,
          row_number() OVER (PARTITION BY visit_id ORDER BY created_at) AS event_number
      from website_event
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}),
    ${sequenceQuery}
    select *
    from sequences
    where 1 = 1
    ${startStepQuery}
    ${endStepQuery}
    order by count desc
    limit 100
    `,
    {
      websiteId,
      startDate,
      endDate,
      ...params,
    },
  ).then(parseResult);
}

async function clickhouseQuery(
  websiteId: string,
  filters: {
    startDate: Date;
    endDate: Date;
    steps: number;
    startStep?: string;
    endStep?: string;
  },
): Promise<JourneyResult[]> {
  const { startDate, endDate, steps, startStep, endStep } = filters;
  const { rawQuery } = clickhouse;
  const { sequenceQuery, startStepQuery, endStepQuery, params } = getJourneyQuery(
    steps,
    startStep,
    endStep,
  );

  function getJourneyQuery(
    steps: number,
    startStep?: string,
    endStep?: string,
  ): {
    sequenceQuery: string;
    startStepQuery: string;
    endStepQuery: string;
    params: { [key: string]: string };
  } {
    const params = {};
    let sequenceQuery = '';
    let startStepQuery = '';
    let endStepQuery = '';

    // create sequence query
    let selectQuery = '';
    let maxQuery = '';
    let groupByQuery = '';

    for (let i = 1; i <= steps; i++) {
      const endQuery = i < steps ? ',' : '';
      selectQuery += `s.e${i},`;
      maxQuery += `\nmax(CASE WHEN event_number = ${i} THEN event ELSE NULL END) AS e${i}${endQuery}`;
      groupByQuery += `s.e${i}${endQuery} `;
    }

    sequenceQuery = `\nsequences as (
          select ${selectQuery}
          count(*) count
      FROM (
        select visit_id,
            ${maxQuery}
        FROM events
        group by visit_id) s
      group by ${groupByQuery})
    `;

    // create start Step params query
    if (startStep) {
      startStepQuery = `and e1 = {startStep:String}`;
      params['startStep'] = startStep;
    }

    // create end Step params query
    if (endStep) {
      for (let i = 1; i < steps; i++) {
        const startQuery = i === 1 ? 'and (' : '\nor ';
        endStepQuery += `${startQuery}(e${i} = {endStep:String} and e${i + 1} is null) `;
      }
      endStepQuery += `\nor (e${steps} = {endStep:String}))`;

      params['endStep'] = endStep;
    }

    return {
      sequenceQuery,
      startStepQuery,
      endStepQuery,
      params,
    };
  }

  return rawQuery(
    `
    WITH events AS (
      select distinct
          visit_id,
          coalesce(nullIf(event_name, ''), url_path) event,
          row_number() OVER (PARTITION BY visit_id ORDER BY created_at) AS event_number
      from umami.website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}),
    ${sequenceQuery}
    select *
    from sequences
    where 1 = 1
    ${startStepQuery}
    ${endStepQuery}
    order by count desc
    limit 100
    `,
    {
      websiteId,
      startDate,
      endDate,
      ...params,
    },
  ).then(parseResult);
}

function combineSequentialDuplicates(array: any) {
  if (array.length === 0) return array;

  const result = [array[0]];

  for (let i = 1; i < array.length; i++) {
    if (array[i] !== array[i - 1]) {
      result.push(array[i]);
    }
  }

  return result;
}

function parseResult(data: any) {
  return data.map(({ e1, e2, e3, e4, e5, e6, e7, count }) => ({
    items: combineSequentialDuplicates([e1, e2, e3, e4, e5, e6, e7]),
    count: +Number(count),
  }));
}
