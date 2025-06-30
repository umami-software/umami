import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface AttributionCriteria {
  startDate: Date;
  endDate: Date;
  model: string;
  type: string;
  step: string;
  currency?: string;
}

export interface AttributionResult {
  referrer: { name: string; value: number }[];
  paidAds: { name: string; value: number }[];
  utm_source: { name: string; value: number }[];
  utm_medium: { name: string; value: number }[];
  utm_campaign: { name: string; value: number }[];
  utm_content: { name: string; value: number }[];
  utm_term: { name: string; value: number }[];
  total: { pageviews: number; visitors: number; visits: number };
}

export async function getAttribution(...args: [websiteId: string, criteria: AttributionCriteria]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: AttributionCriteria,
): Promise<AttributionResult> {
  const { startDate, endDate, model, type, step, currency } = criteria;
  const { rawQuery } = prisma;
  const eventType = type === 'page' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'page' ? 'url_path' : 'event_name';

  function getUTMQuery(utmColumn: string) {
    return `
    select 
        coalesce(we.${utmColumn}, '') name,
        ${currency ? 'sum(e.value)' : 'count(distinct we.session_id)'} value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? 'join events e on e.session_id = m.session_id' : ''}
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
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
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
          and ${column} = {{conversionStep}}
          and event_type = {{eventType}}
        group by 1),`;

  const revenueEventQuery = `WITH events AS (
        select
          session_id,
          max(created_at) max_dt,
          sum(revenue) value
        from revenue
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
          and ${column} = {{conversionStep}}
          and currency = {{currency}}
        group by 1),`;

  function getModelQuery(model: string) {
    return model === 'first-click'
      ? `\n 
    model AS (select e.session_id,
        min(we.created_at) created_at
    from events e
    join website_event we
    on we.session_id = e.session_id
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
    group by e.session_id)`
      : `\n 
    model AS (select e.session_id,
        max(we.created_at) created_at
    from events e
    join website_event we
    on we.session_id = e.session_id
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}} 
          and we.created_at < e.max_dt
    group by e.session_id)`;
  }

  const referrerRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    select coalesce(we.referrer_domain, '') name,
        ${currency ? 'sum(e.value)' : 'count(distinct we.session_id)'} value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    join session s
    on s.session_id = m.session_id
    ${currency ? 'join events e on e.session_id = m.session_id' : ''}
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
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
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const paidAdsres = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)},

    results AS (
    select case
            when coalesce(gclid, '') != '' then 'Google Ads' 
            when coalesce(fbclid, '') != '' then 'Facebook / Meta' 
            when coalesce(msclkid, '') != '' then 'Microsoft Ads' 
            when coalesce(ttclid, '') != '' then 'TikTok Ads' 
            when coalesce(li_fat_id, '') != '' then 'LinkedIn Ads' 
            when coalesce(twclid, '') != '' then 'Twitter Ads (X)'
            else ''
          end name,
        ${currency ? 'sum(e.value)' : 'count(distinct we.session_id)'} value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    ${currency ? 'join events e on e.session_id = m.session_id' : ''}
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
    group by 1
    order by 2 desc
    limit 20)
    SELECT * 
    FROM results
    ${currency ? '' : `WHERE name != ''`}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const sourceRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const mediumRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const campaignRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const contentRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const termRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
  );

  const totalRes = await rawQuery(
    `
    select 
        count(*) as "pageviews",
        count(distinct session_id) as "visitors",
        count(distinct visit_id) as "visits"
    from website_event
    where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
        and ${column} = {{conversionStep}}
        and event_type = {{eventType}}
    `,
    { websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
  criteria: AttributionCriteria,
): Promise<AttributionResult> {
  const { startDate, endDate, model, type, step, currency } = criteria;
  const { rawQuery, parseFilters } = clickhouse;
  const eventType = type === 'page' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'page' ? 'url_path' : 'event_name';
  const { filterQuery, filterParams } = await parseFilters(websiteId, criteria);

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
      limit 20
    `;
  }

  function getModelQuery(model: string) {
    if (model === 'first-click') {
      return ` 
        model AS (select e.session_id,
            min(we.created_at) created_at
        from events e
        join website_event we
        on we.session_id = e.session_id
        where we.website_id = {websiteId:UUID}
          and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
          ${filterQuery}
        group by e.session_id)
      `;
    }

    return `
      model AS (select e.session_id,
          max(we.created_at) created_at
      from events e
      join website_event we
      on we.session_id = e.session_id
      where we.website_id = {websiteId:UUID}
        and we.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and we.created_at < e.max_dt
        ${filterQuery}
      group by e.session_id)
      `;
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
              session_id,
              max(created_at) max_dt,
              sum(revenue) as value
          from website_revenue
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and ${column} = {conversionStep:String}
            and currency = {currency:String}
          group by 1),`;

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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
                   li_fat_id != '', 'LinkedIn Ads', 
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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
        ${filterQuery}
    `,
    { ...filterParams, websiteId, startDate, endDate, conversionStep: step, eventType, currency },
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
