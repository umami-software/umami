import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface AttributionParameters {
  startDate: Date;
  endDate: Date;
  model: string;
  type: string;
  step: string;
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
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: AttributionParameters,
  filters: QueryFilters,
): Promise<AttributionResult> {
  const { model, type } = parameters;
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
        coalesce(we.${utmColumn}, '') as "name",
        count(distinct we.session_id) as "value"
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
          and we.${utmColumn} != ''
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
    ${eventQuery}
    ${getModelQuery(model)}
    select coalesce(we.referrer_domain, '') as "name",
        count(distinct we.session_id) value
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    join session s
    on s.session_id = m.session_id
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
          and we.referrer_domain != regexp_replace(we.hostname, '^www.', '')
          and we.referrer_domain != ''
    group by 1
    order by 2 desc
    limit 20
    `,
    queryParams,
  );

  const paidAdsres = await rawQuery(
    `
    ${eventQuery}
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
          end as "name",
        count(distinct we.session_id) as "value"
    from model m
    join website_event we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    where we.website_id = {{websiteId::uuid}}
          and we.created_at between {{startDate}} and {{endDate}}
    group by 1
    order by 2 desc
    limit 20)
    SELECT *
    FROM results
    WHERE name != ''
    `,
    queryParams,
  );

  const sourceRes = await rawQuery(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    queryParams,
  );

  const mediumRes = await rawQuery(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    queryParams,
  );

  const campaignRes = await rawQuery(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    queryParams,
  );

  const contentRes = await rawQuery(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    queryParams,
  );

  const termRes = await rawQuery(
    `
    ${eventQuery}
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
  const { model, type } = parameters;
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
          uniqExact(we.session_id) value
      from model m
      join (
        select *
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ) we
      on we.created_at = m.created_at
          and we.session_id = m.session_id
      where we.${utmColumn} != ''
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
        join (
          select *
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ) we
        on we.session_id = e.session_id
        group by e.session_id)
      `;
    }

    return `
      model AS (select e.session_id,
          max(we.created_at) created_at
      from events e
      join (
        select *
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ) we
      on we.session_id = e.session_id
      where we.created_at < e.max_dt
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

  const referrerRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    select we.referrer_domain name,
        uniqExact(we.session_id) value
    from model m
    join (
      select *
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ) we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    where we.referrer_domain != hostname
      and we.referrer_domain != ''
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
    ${eventQuery}
    ${getModelQuery(model)}
    select multiIf(gclid != '', 'Google Ads',
                   fbclid != '', 'Facebook / Meta',
                   msclkid != '', 'Microsoft Ads',
                   ttclid != '', 'TikTok Ads',
                   li_fat_id != '', 'LinkedIn Ads',
                   twclid != '', 'Twitter Ads (X)','') name,
        uniqExact(we.session_id) value
    from model m
    join (
      select *
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ) we
    on we.created_at = m.created_at
        and we.session_id = m.session_id
    where name != ''
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
    ${eventQuery}
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
    ${eventQuery}
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
    ${eventQuery}
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
    ${eventQuery}
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
    ${eventQuery}
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

async function oceanbaseQuery(
  websiteId: string,
  parameters: AttributionParameters,
  filters: QueryFilters,
): Promise<AttributionResult> {
  const { model, type, startDate, endDate, step } = parameters;
  const { rawQuery, parseFilters } = oceanbase;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    ...parameters,
    websiteId,
    eventType,
  });

  // eventQuery placeholders: cohortQuery(0|3) + WHERE(websiteId, startDate, endDate, step) + filterQuery(N)
  const eventQueryParams = [
    ...(cohortQuery ? [websiteId, startDate, endDate] : []),
    websiteId, startDate, endDate, step,
    ...queryParams,
  ];

  // modelQuery placeholders: websiteId, startDate, endDate
  const modelParams = [websiteId, startDate, endDate];

  function getUTMQuery(utmColumn: string) {
    return `
    SELECT
        COALESCE(we.${utmColumn}, '') AS name,
        COUNT(DISTINCT we.session_id) AS value
    FROM model m
    JOIN website_event we
    ON we.created_at = m.created_at
        AND we.session_id = m.session_id
    WHERE we.website_id = ?
          AND we.created_at BETWEEN ? AND ?
          AND we.${utmColumn} != ''
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 20`;
  }

  const eventQuery = `WITH events AS (
        SELECT DISTINCT
            website_event.session_id,
            MAX(website_event.created_at) AS max_dt
        FROM website_event
        ${cohortQuery}
        ${joinSessionQuery}
        WHERE website_event.website_id = ?
          AND website_event.created_at BETWEEN ? AND ?
          AND website_event.${column} = ?
          ${filterQuery}
        GROUP BY 1),`;

  function getModelQuery(model: string) {
    return model === 'first-click'
      ? `\n
    model AS (SELECT e.session_id,
        MIN(we.created_at) AS created_at
    FROM events e
    JOIN website_event we
    ON we.session_id = e.session_id
    WHERE we.website_id = ?
          AND we.created_at BETWEEN ? AND ?
    GROUP BY e.session_id)`
      : `\n
    model AS (SELECT e.session_id,
        MAX(we.created_at) AS created_at
    FROM events e
    JOIN website_event we
    ON we.session_id = e.session_id
    WHERE we.website_id = ?
          AND we.created_at BETWEEN ? AND ?
          AND we.created_at < e.max_dt
    GROUP BY e.session_id)`;
  }

  // All CTE queries share the same param structure: eventQuery + modelQuery + final(3)
  const cteParams = [...eventQueryParams, ...modelParams, websiteId, startDate, endDate];

  const referrerRes = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    SELECT COALESCE(we.referrer_domain, '') AS name,
        COUNT(DISTINCT we.session_id) AS value
    FROM model m
    JOIN website_event we
    ON we.created_at = m.created_at
        AND we.session_id = m.session_id
    JOIN session s
    ON s.session_id = m.session_id
    WHERE we.website_id = ?
          AND we.created_at BETWEEN ? AND ?
          AND we.referrer_domain != REGEXP_REPLACE(we.hostname, '^www.', '')
          AND we.referrer_domain != ''
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 20
    `,
    cteParams,
  );

  const paidAdsres = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)},

    results AS (
    SELECT CASE
            WHEN COALESCE(gclid, '') != '' THEN 'Google Ads'
            WHEN COALESCE(fbclid, '') != '' THEN 'Facebook / Meta'
            WHEN COALESCE(msclkid, '') != '' THEN 'Microsoft Ads'
            WHEN COALESCE(ttclid, '') != '' THEN 'TikTok Ads'
            WHEN COALESCE(li_fat_id, '') != '' THEN 'LinkedIn Ads'
            WHEN COALESCE(twclid, '') != '' THEN 'Twitter Ads (X)'
            ELSE ''
          END AS name,
        COUNT(DISTINCT we.session_id) AS value
    FROM model m
    JOIN website_event we
    ON we.created_at = m.created_at
        AND we.session_id = m.session_id
    WHERE we.website_id = ?
          AND we.created_at BETWEEN ? AND ?
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 20)
    SELECT *
    FROM results
    WHERE name != ''
    `,
    cteParams,
  );

  const sourceRes = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    cteParams,
  );

  const mediumRes = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    cteParams,
  );

  const campaignRes = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    cteParams,
  );

  const contentRes = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    cteParams,
  );

  const termRes = await rawQuery<{ name: string; value: number }[]>(
    `
    ${eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    cteParams,
  );

  // totalRes: cohort(0|3) + WHERE(websiteId, startDate, endDate, step) + filterQuery(N)
  const totalParams = [
    ...(cohortQuery ? [websiteId, startDate, endDate] : []),
    websiteId, startDate, endDate, step,
    ...queryParams,
  ];

  const totalRes = await rawQuery<{ pageviews: number; visitors: number; visits: number }[]>(
    `
    SELECT
        COUNT(*) AS pageviews,
        COUNT(DISTINCT website_event.session_id) AS visitors,
        COUNT(DISTINCT website_event.visit_id) AS visits
    FROM website_event
    ${joinSessionQuery}
    ${cohortQuery}
    WHERE website_event.website_id = ?
        AND website_event.created_at BETWEEN ? AND ?
        AND website_event.${column} = ?
        ${filterQuery}
    `,
    totalParams,
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
