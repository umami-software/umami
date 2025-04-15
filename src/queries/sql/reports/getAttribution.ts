import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export async function getAttribution(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      model: string;
      steps: { type: string; value: string }[];
      currency: string;
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
    model: string;
    steps: { type: string; value: string }[];
    currency: string;
  },
): Promise<{
  referrer: { name: string; value: number }[];
  paidAds: { name: string; value: number }[];
  utm_source: { name: string; value: number }[];
  utm_medium: { name: string; value: number }[];
  utm_campaign: { name: string; value: number }[];
  utm_content: { name: string; value: number }[];
  utm_term: { name: string; value: number }[];
  total: { pageviews: number; visitors: number; visits: number };
}> {
  const { startDate, endDate, model, steps, currency } = criteria;
  const { rawQuery } = prisma;
  const conversionStep = steps[0].value;
  const eventType = steps[0].type === 'url' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = steps[0].type === 'url' ? 'url_path' : 'event_name';
  //const db = getDatabaseType();
  //const like = db === POSTGRESQL ? 'ilike' : 'like';

  function getUTMQuery(utmColumn: string) {
    return `
    select 
        we.${utmColumn} name,
        ${currency ? 'sum(e.value)' : 'uniqExact(we.session_id)'} value
    from events e
    join model m
    on m.session_id = e.session_id
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? '' : `where we.${utmColumn} != ''`}  
    group by 1
    order by 2 desc
    limit 20`;
  }

  const eventQuery = `WITH events AS (
        select distinct
            session_id,
            max(created_at) max_dt
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and ${column} = {conversionStep:String}
          and event_type = {eventType:UInt32}
        group by 1),`;

  const revenueEventQuery = `WITH events AS (
          select
              ed.session_id,
              max(ed.created_at) max_dt,
              sum(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) as value
          from event_data ed
          join (select event_id
                from event_data
                where website_id = {websiteId:UUID}
                  and created_at between {startDate:DateTime64} and {endDate:DateTime64}
                  and positionCaseInsensitive(data_key, 'currency') > 0
                  and string_value = {currency:String}) c
            on c.event_id = ed.event_id
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and ${column} = {conversionStep:String} 
            and positionCaseInsensitive(ed.data_key, 'revenue') > 0
          group by 1),`;

  function getModelQuery(model: string) {
    return model === 'firstClick'
      ? `\n 
    model AS (select e.session_id,
        min(we.created_at) created_at
    from events e
    join website_event we
    on we.session_id = e.session_id
    group by e.session_id)`
      : `\n 
    model AS (select e.session_id,
        max(we.created_at) created_at
    from events e
    join website_event we
    on we.session_id = e.session_id
    where we.created_at < e.max_dt
    group by e.session_id)`;
  }

  const referrerRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    select we.referrer_domain name,
        ${currency ? 'sum(e.value)' : 'uniqExact(we.session_id)'} value
    from events e
    join model m
    on m.session_id = e.session_id
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${
      currency
        ? ''
        : `where referrer_domain != hostname
      and we.referrer_domain != ''`
    }  
    group by 1
    order by 2 desc
    limit 20
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const paidAdsres = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    select multiIf(gclid != '', 'Google', fbclid != '', 'Facebook', '') name,
        ${currency ? 'sum(e.value)' : 'uniqExact(we.session_id)'} value
    from events e
    join model m
    on m.session_id = e.session_id
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? '' : `WHERE name != ''`}
    group by 1
    order by 2 desc
    limit 20
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const sourceRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const mediumRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const campaignRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const contentRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const termRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const totalRes = await rawQuery(
    `
    select 
        count(*) as "pageviews",
        uniqExact(session_id) as "visitors",
        uniqExact(visit_id) as "visits"
    from website_event
    where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and ${column} = {conversionStep:String}
        and event_type = {eventType:UInt32}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  ).then(result => result?.[0]);

  return {
    referrer: referrerRes,
    paidAds: paidAdsres,
    utm_source: sourceRes,
    utm_medium: mediumRes,
    utm_campaign: campaignRes,
    utm_content: contentRes,
    utm_term: termRes,
    total: totalRes,
  };
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    model: string;
    steps: { type: string; value: string }[];
    currency: string;
  },
): Promise<{
  referrer: { name: string; value: number }[];
  paidAds: { name: string; value: number }[];
  utm_source: { name: string; value: number }[];
  utm_medium: { name: string; value: number }[];
  utm_campaign: { name: string; value: number }[];
  utm_content: { name: string; value: number }[];
  utm_term: { name: string; value: number }[];
  total: { pageviews: number; visitors: number; visits: number };
}> {
  const { startDate, endDate, model, steps, currency } = criteria;
  const { rawQuery } = clickhouse;
  const conversionStep = steps[0].value;
  const eventType = steps[0].type === 'url' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = steps[0].type === 'url' ? 'url_path' : 'event_name';

  function getUTMQuery(utmColumn: string) {
    return `
    select 
        we.${utmColumn} name,
        ${currency ? 'sum(e.value)' : 'uniqExact(we.session_id)'} value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? 'join events e on e.session_id = m.session_id' : ''}
    where we.website_id = {websiteId:UUID}
          and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${currency ? '' : `and we.${utmColumn} != ''`}  
    group by 1
    order by 2 desc
    limit 20`;
  }

  const eventQuery = `WITH events AS (
        select distinct
            session_id,
            max(created_at) max_dt
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and ${column} = {conversionStep:String}
          and event_type = {eventType:UInt32}
        group by 1),`;

  const revenueEventQuery = `WITH events AS (
          select
              ed.session_id,
              max(ed.created_at) max_dt,
              sum(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) as value
          from event_data ed
          join (select event_id
                from event_data
                where website_id = {websiteId:UUID}
                  and created_at between {startDate:DateTime64} and {endDate:DateTime64}
                  and positionCaseInsensitive(data_key, 'currency') > 0
                  and string_value = {currency:String}) c
            on c.event_id = ed.event_id
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and ${column} = {conversionStep:String} 
            and positionCaseInsensitive(ed.data_key, 'revenue') > 0
          group by 1),`;

  function getModelQuery(model: string) {
    return model === 'firstClick'
      ? `\n 
    model AS (select e.session_id,
        min(we.created_at) created_at
    from events e
    join website_event we
    on we.session_id = e.session_id
    where we.website_id = {websiteId:UUID}
      and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by e.session_id)`
      : `\n 
    model AS (select e.session_id,
        max(we.created_at) created_at
    from events e
    join website_event we
    on we.session_id = e.session_id
    where we.website_id = {websiteId:UUID}
      and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and we.created_at < e.max_dt
    group by e.session_id)`;
  }

  const referrerRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    select we.referrer_domain name,
        ${currency ? 'sum(e.value)' : 'uniqExact(we.session_id)'} value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? 'join events e on e.session_id = m.session_id' : ''}
    where we.website_id = {websiteId:UUID}
          and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${
      currency
        ? ''
        : `and we.referrer_domain != hostname
      and we.referrer_domain != ''`
    }  
    group by 1
    order by 2 desc
    limit 20
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const paidAdsres = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    select multiIf(gclid != '', 'Google Ads', 
                   fbclid != '', 'Facebook / Meta', 
                   msclkid != '', 'Microsoft Ads', 
                   ttclid != '', 'TikTok Ads', 
                   li_fat_id != '', '	LinkedIn Ads', 
                   twclid != '', 'Twitter Ads (X)','') name,
        ${currency ? 'sum(e.value)' : 'uniqExact(we.session_id)'} value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? 'join events e on e.session_id = m.session_id' : ''}
    where we.website_id = {websiteId:UUID}
      and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${currency ? '' : `and name != ''`}
    group by 1
    order by 2 desc
    limit 20
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const sourceRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const mediumRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const campaignRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const contentRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const termRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  );

  const totalRes = await rawQuery<{ pageviews: number; visitors: number; visits: number }>(
    `
    select 
        count(*) as "pageviews",
        uniqExact(session_id) as "visitors",
        uniqExact(visit_id) as "visits"
    from website_event
    where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and ${column} = {conversionStep:String}
        and event_type = {eventType:UInt32}
    `,
    { websiteId, startDate, endDate, conversionStep, eventType, currency },
  ).then(result => result?.[0]);

  return {
    referrer: referrerRes,
    paidAds: paidAdsres,
    utm_source: sourceRes,
    utm_medium: mediumRes,
    utm_campaign: campaignRes,
    utm_content: contentRes,
    utm_term: termRes,
    total: totalRes,
  };
}
