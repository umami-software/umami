import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export async function getGoals(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      goals: { type: string; value: string; goal: number; operator?: string }[];
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
    goals: { type: string; value: string; goal: number; operator?: string }[];
  },
): Promise<any> {
  const { startDate, endDate, goals } = criteria;
  const { rawQuery } = prisma;

  const urls = goals.filter(a => a.type === 'url');
  const events = goals.filter(a => a.type === 'event');
  const eventData = goals.filter(a => a.type === 'event-data');

  const hasUrl = urls.length > 0;
  const hasEvent = events.length > 0;
  const hasEventData = eventData.length > 0;

  function getParameters(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
    eventData: {
      type: string;
      value: string;
      goal: number;
      operator?: string;
      property?: string;
    }[],
  ) {
    const urlParam = urls.reduce((acc, cv, i) => {
      acc[`${cv.type}${i}`] = cv.value;
      return acc;
    }, {});

    const eventParam = events.reduce((acc, cv, i) => {
      acc[`${cv.type}${i}`] = cv.value;
      return acc;
    }, {});

    const eventDataParam = eventData.reduce((acc, cv, i) => {
      acc[`eventData${i}`] = cv.value;
      acc[`property${i}`] = cv.property;
      return acc;
    }, {});

    return {
      urls: { ...urlParam, startDate, endDate, websiteId },
      events: { ...eventParam, startDate, endDate, websiteId },
      eventData: { ...eventDataParam, startDate, endDate, websiteId },
    };
  }

  function getColumns(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
    eventData: {
      type: string;
      value: string;
      goal: number;
      operator?: string;
      property?: string;
    }[],
  ) {
    const urlColumns = urls
      .map((a, i) => `COUNT(CASE WHEN url_path = {{url${i}}} THEN 1 END) AS URL${i},`)
      .join('\n')
      .slice(0, -1);
    const eventColumns = events
      .map((a, i) => `COUNT(CASE WHEN event_name = {{event${i}}} THEN 1 END) AS EVENT${i},`)
      .join('\n')
      .slice(0, -1);
    const eventDataColumns = eventData
      .map(
        (a, i) =>
          `${
            a.operator === 'average' ? 'avg' : a.operator
          }(CASE WHEN event_name = {{eventData${i}}} AND data_key = {{property${i}}} THEN ${
            a.operator === 'count' ? '1' : 'number_value'
          } END) AS EVENT_DATA${i},`,
      )
      .join('\n')
      .slice(0, -1);

    return { urls: urlColumns, events: eventColumns, eventData: eventDataColumns };
  }

  function getWhere(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
    eventData: {
      type: string;
      value: string;
      goal: number;
      operator?: string;
      property?: string;
    }[],
  ) {
    const urlWhere = urls.map((a, i) => `{{url${i}}}`).join(',');
    const eventWhere = events.map((a, i) => `{{event${i}}}`).join(',');
    const eventDataNameWhere = eventData.map((a, i) => `{{eventData${i}}}`).join(',');
    const eventDataKeyWhere = eventData.map((a, i) => `{{property${i}}}`).join(',');

    return {
      urls: `and url_path in (${urlWhere})`,
      events: `and event_name in (${eventWhere})`,
      eventData: `and event_name in (${eventDataNameWhere}) and data_key in (${eventDataKeyWhere})`,
    };
  }

  const parameters = getParameters(urls, events, eventData);
  const columns = getColumns(urls, events, eventData);
  const where = getWhere(urls, events, eventData);

  const urlResults = hasUrl
    ? await rawQuery(
        `
  select
    ${columns.urls}
  from website_event
    where website_id = {{websiteId::uuid}}
      ${where.urls}
      and created_at between {{startDate}} and {{endDate}}
  `,
        parameters.urls,
      ).then(a => {
        const results = a[0];

        return Object.keys(results).map((key, i) => ({
          ...urls[i],
          goal: Number(urls[i].goal),
          result: Number(results[key]),
        }));
      })
    : [];

  const eventResults = hasEvent
    ? await rawQuery(
        `
  select
    ${columns.events}
  from website_event
    where website_id = {{websiteId::uuid}}
      ${where.events}
      and created_at between {{startDate}} and {{endDate}}
  `,
        parameters.events,
      ).then(a => {
        const results = a[0];

        return Object.keys(results).map((key, i) => {
          return { ...events[i], goal: Number(events[i].goal), result: Number(results[key]) };
        });
      })
    : [];

  const eventDataResults = hasEventData
    ? await rawQuery(
        `
  select
    ${columns.eventData}
  from website_event w
      join event_data d
      on d.website_event_id = w.event_id
    where w.website_id = {{websiteId::uuid}}
      ${where.eventData}
      and w.created_at between {{startDate}} and {{endDate}}
  `,
        parameters.eventData,
      ).then(a => {
        const results = a[0];

        return Object.keys(results).map((key, i) => {
          return { ...eventData[i], goal: Number(eventData[i].goal), result: Number(results[key]) };
        });
      })
    : [];

  return [...urlResults, ...eventResults, ...eventDataResults];
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    goals: { type: string; value: string; goal: number; operator?: string; property?: string }[];
  },
): Promise<{ type: string; value: string; goal: number; result: number }[]> {
  const { startDate, endDate, goals } = criteria;
  const { rawQuery } = clickhouse;

  const urls = goals.filter(a => a.type === 'url');
  const events = goals.filter(a => a.type === 'event');
  const eventData = goals.filter(a => a.type === 'event-data');

  const hasUrl = urls.length > 0;
  const hasEvent = events.length > 0;
  const hasEventData = eventData.length > 0;

  function getParameters(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
    eventData: {
      type: string;
      value: string;
      goal: number;
      operator?: string;
      property?: string;
    }[],
  ) {
    const urlParam = urls.reduce((acc, cv, i) => {
      acc[`${cv.type}${i}`] = cv.value;
      return acc;
    }, {});

    const eventParam = events.reduce((acc, cv, i) => {
      acc[`${cv.type}${i}`] = cv.value;
      return acc;
    }, {});

    const eventDataParam = eventData.reduce((acc, cv, i) => {
      acc[`eventData${i}`] = cv.value;
      acc[`property${i}`] = cv.property;
      return acc;
    }, {});

    return {
      urls: { ...urlParam, startDate, endDate, websiteId },
      events: { ...eventParam, startDate, endDate, websiteId },
      eventData: { ...eventDataParam, startDate, endDate, websiteId },
    };
  }

  function getColumns(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
    eventData: {
      type: string;
      value: string;
      goal: number;
      operator?: string;
      property?: string;
    }[],
  ) {
    const urlColumns = urls
      .map((a, i) => `countIf(url_path = {url${i}:String}) AS URL${i},`)
      .join('\n')
      .slice(0, -1);
    const eventColumns = events
      .map((a, i) => `countIf(event_name = {event${i}:String}) AS EVENT${i},`)
      .join('\n')
      .slice(0, -1);
    const eventDataColumns = eventData
      .map(
        (a, i) =>
          `${a.operator === 'average' ? 'avg' : a.operator}If(${
            a.operator !== 'count' ? 'number_value, ' : ''
          }event_name = {eventData${i}:String} AND data_key = {property${i}:String}) AS EVENT_DATA${i},`,
      )
      .join('\n')
      .slice(0, -1);

    return { url: urlColumns, events: eventColumns, eventData: eventDataColumns };
  }

  function getWhere(
    urls: { type: string; value: string; goal: number }[],
    events: { type: string; value: string; goal: number }[],
    eventData: {
      type: string;
      value: string;
      goal: number;
      operator?: string;
      property?: string;
    }[],
  ) {
    const urlWhere = urls.map((a, i) => `{url${i}:String}`).join(',');
    const eventWhere = events.map((a, i) => `{event${i}:String}`).join(',');
    const eventDataNameWhere = eventData.map((a, i) => `{eventData${i}:String}`).join(',');
    const eventDataKeyWhere = eventData.map((a, i) => `{property${i}:String}`).join(',');

    return {
      urls: `and url_path in (${urlWhere})`,
      events: `and event_name in (${eventWhere})`,
      eventData: `and event_name in (${eventDataNameWhere}) and data_key in (${eventDataKeyWhere})`,
    };
  }

  const parameters = getParameters(urls, events, eventData);
  const columns = getColumns(urls, events, eventData);
  const where = getWhere(urls, events, eventData);

  const urlResults = hasUrl
    ? await rawQuery(
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
    ? await rawQuery(
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

  const eventDataResults = hasEventData
    ? await rawQuery(
        `
  select
    ${columns.eventData}
  from event_data
  where website_id = {websiteId:UUID}
    ${where.eventData}
    and created_at between {startDate:DateTime64} and {endDate:DateTime64}
  `,
        parameters.eventData,
      ).then(a => {
        const results = a[0];

        return Object.keys(results).map((key, i) => {
          return { ...eventData[i], goal: Number(eventData[i].goal), result: Number(results[key]) };
        });
      })
    : [];

  return [...urlResults, ...eventResults, ...eventDataResults];
}
