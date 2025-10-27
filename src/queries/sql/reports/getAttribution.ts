import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface AttributionParameters {
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

export async function getAttribution(
  ...args: [websiteId: string, parameters: AttributionParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: AttributionParameters,
  filters: QueryFilters,
): Promise<AttributionResult> {
  const { model, type, currency } = parameters;
  const { rawQuery, parseFilters } = prisma;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    ...parameters,
    websiteId,
    eventType,
  });

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
            website_event.session_id,
            max(website_event.created_at) max_dt
        from website_event
        ${cohortQuery}
        ${joinSessionQuery}
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.created_at between {{startDate}} and {{endDate}}
          and website_event.${column} = {{step}}
          ${filterQuery}
        group by 1),`;

  const revenueEventQuery = `WITH events AS (
        select
          revenue.session_id,
          max(revenue.created_at) max_dt,
          sum(revenue.revenue) value
        from revenue
        join website_event
          on website_event.website_id = revenue.website_id
            and website_event.session_id = revenue.session_id
            and website_event.event_id = revenue.event_id
            and website_event.website_id = {{websiteId::uuid}}
            and website_event.created_at between {{startDate}} and {{endDate}}
        ${cohortQuery}
        ${joinSessionQuery}
        where revenue.website_id = {{websiteId::uuid}}
          and revenue.created_at between {{startDate}} and {{endDate}}
          and revenue.${column} = {{step}}
          and revenue.currency = {{currency}}
          ${filterQuery}
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
    queryParams,
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
    queryParams,
  );

  const sourceRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    queryParams,
  );

  const mediumRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    queryParams,
  );

  const campaignRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    queryParams,
  );

  const contentRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    queryParams,
  );

  const termRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    queryParams,
  );

  const totalRes = await rawQuery(
    `
    select 
        count(*) as "pageviews",
        count(distinct website_event.session_id) as "visitors",
        count(distinct website_event.visit_id) as "visits"
    from website_event
    ${joinSessionQuery}
    ${cohortQuery}
    where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.${column} = {{step}}
        ${filterQuery}
    `,
    queryParams,
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
  parameters: AttributionParameters,
  filters: QueryFilters,
): Promise<AttributionResult> {
  const { model, type, currency } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    ...parameters,
    websiteId,
    eventType,
  });

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
      group by e.session_id)
      `;
  }

  const eventQuery = `WITH events AS (
        select distinct
            session_id,
            max(created_at) max_dt
        from website_event
        ${cohortQuery}
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and ${column} = {step:String}
          ${filterQuery}
        group by 1),`;

  const revenueEventQuery = `WITH events AS (
          select
              website_revenue.session_id,
              max(website_revenue.created_at) max_dt,
              sum(website_revenue.revenue) as value
          from website_revenue
          join website_event
          on website_event.website_id = website_revenue.website_id
            and website_event.session_id = website_revenue.session_id
            and website_event.event_id = website_revenue.event_id
            and website_event.website_id = {websiteId:UUID}
            and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
          ${cohortQuery}
          where website_revenue.website_id = {websiteId:UUID}
            and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and website_revenue.${column} = {step:String}
            and website_revenue.currency = {currency:String}
            ${filterQuery}
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
    queryParams,
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
    queryParams,
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
    queryParams,
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
    queryParams,
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
    queryParams,
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
    queryParams,
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
    queryParams,
  );

  const totalRes = await rawQuery<{ pageviews: number; visitors: number; visits: number }>(
    `
    select 
        count(*) as "pageviews",
        uniqExact(session_id) as "visitors",
        uniqExact(visit_id) as "visits"
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and ${column} = {step:String}
        ${filterQuery}
    `,
    queryParams,
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
