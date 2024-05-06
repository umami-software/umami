import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getGoals(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      goals: { type: string; value: string; goal: number }[];
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
    startDate: Date;
    endDate: Date;
    goals: { type: string; value: string; goal: number }[];
  },
): Promise<any> {
  const { startDate, endDate, goals } = criteria;
  const { rawQuery } = prisma;

  const hasUrl = goals.some(a => a.type === 'url');
  const hasEvent = goals.some(a => a.type === 'event');

  function getParameters(goals: { type: string; value: string; goal: number }[]) {
    const urls = goals
      .filter(a => a.type === 'url')
      .reduce((acc, cv, i) => {
        acc[`${cv.type}${i}`] = cv.value;
        return acc;
      }, {});

    const events = goals
      .filter(a => a.type === 'event')
      .reduce((acc, cv, i) => {
        acc[`${cv.type}${i}`] = cv.value;
        return acc;
      }, {});

    return {
      urls: { ...urls, startDate, endDate, websiteId },
      events: { ...events, startDate, endDate, websiteId },
    };
  }

  function getColumns(goals: { type: string; value: string; goal: number }[]) {
    const urls = goals
      .filter(a => a.type === 'url')
      .map((a, i) => `COUNT(CASE WHEN url_path =  {{url${i}}} THEN 1 END) AS URL${i}`)
      .join('\n');
    const events = goals
      .filter(a => a.type === 'event')
      .map((a, i) => `COUNT(CASE WHEN url_path =  {{event${i}}} THEN 1 END) AS EVENT${i}`)
      .join('\n');

    return { urls, events };
  }

  function getWhere(goals: { type: string; value: string; goal: number }[]) {
    const urls = goals
      .filter(a => a.type === 'url')
      .map((a, i) => `{{url${i}}}`)
      .join(',');
    const events = goals
      .filter(a => a.type === 'event')
      .map((a, i) => `{{event${i}}}`)
      .join(',');

    return { urls: `and url_path in (${urls})`, events: `and event_name in (${events})` };
  }

  const parameters = getParameters(goals);
  const columns = getColumns(goals);
  const where = getWhere(goals);

  const urls = hasUrl
    ? await rawQuery(
        `
  select
    ${columns.urls}
  from website_event
    where websiteId = {{websiteId::uuid}}
      ${where.urls}
      and created_at between {{startDate}} and {{endDate}}
  `,
        parameters.urls,
      )
    : [];

  const events = hasEvent
    ? await rawQuery(
        `
  select
    ${columns.events}
  from website_event
    where websiteId = {{websiteId::uuid}}
      ${where.events}
      and created_at between {{startDate}} and {{endDate}}
  `,
        parameters.events,
      )
    : [];

  return [...urls, ...events];
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    goals: { type: string; value: string; goal: number }[];
  },
): Promise<{ type: string; value: string; goal: number; result: number }[]> {
  const { startDate, endDate, goals } = criteria;
  const { rawQuery } = clickhouse;

  const urls = goals.filter(a => a.type === 'url');
  const events = goals.filter(a => a.type === 'event');

  const hasUrl = urls.length > 0;
  const hasEvent = events.length > 0;

  function getParameters(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
  ) {
    const urlParam = urls.reduce((acc, cv, i) => {
      acc[`${cv.type}${i}`] = cv.value;
      return acc;
    }, {});

    const eventParam = events.reduce((acc, cv, i) => {
      acc[`${cv.type}${i}`] = cv.value;
      return acc;
    }, {});

    return {
      urls: { ...urlParam, startDate, endDate, websiteId },
      events: { ...eventParam, startDate, endDate, websiteId },
    };
  }

  function getColumns(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
  ) {
    const urlColumns = urls
      .map((a, i) => `countIf(url_path = {url${i}:String}) AS URL${i},`)
      .join('\n')
      .slice(0, -1);
    const eventColumns = events
      .map((a, i) => `countIf(event_name = {event${i}:String}) AS EVENT${i}`)
      .join('\n')
      .slice(0, -1);

    return { url: urlColumns, events: eventColumns };
  }

  function getWhere(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
  ) {
    const urlWhere = urls.map((a, i) => `{url${i}:String}`).join(',');
    const eventWhere = events.map((a, i) => `{event${i}:String}`).join(',');

    return { urls: `and url_path in (${urlWhere})`, events: `and event_name in (${eventWhere})` };
  }

  const parameters = getParameters(urls, events);
  const columns = getColumns(urls, events);
  const where = getWhere(urls, events);

  const urlResults = hasUrl
    ? await rawQuery<any>(
        `
  select
    ${columns.url}
  from website_event
    where website_id = {websiteId:UUID}
      ${where.urls}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
  `,
        parameters.urls,
      ).then(a => {
        const results = a[0];

        return Object.keys(results).map((key, i) => {
          return { ...urls[i], goal: Number(urls[i].goal), result: Number(results[key]) };
        });
      })
    : [];

  const eventResults = hasEvent
    ? await rawQuery<any>(
        `
  select
    ${columns.events}
  from website_event
  where website_id = {websiteId:UUID}
    ${where.events}
    and created_at between {startDate:DateTime64} and {endDate:DateTime64}
  `,
        parameters.events,
      ).then(a => {
        const results = a[0];

        return Object.keys(results).map((key, i) => {
          return { ...events[i], goal: Number(events[i].goal), result: Number(results[key]) };
        });
      })
    : [];

  return [...urlResults, ...eventResults];
}
