import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface FeatureAdoptionParameters {
  startDate: Date;
  endDate: Date;
  timezone?: string;
  unit?: string;
  feature: string;
  successEvent?: string;
  window?: number;
}

export interface FeatureAdoptionSeriesItem {
  date: string;
  featureUsers: number;
  newUsers: number;
  returningUsers: number;
}

export interface FeatureAdoptionResult {
  feature: string;
  successEvent: string | null;
  activeUsers: number;
  featureUsers: number;
  newUsers: number;
  returningUsers: number;
  adoptionRate: number;
  completedUsers: number;
  completionRate: number;
  series: FeatureAdoptionSeriesItem[];
}

export async function getFeatureAdoption(
  ...args: [websiteId: string, parameters: FeatureAdoptionParameters, filters: QueryFilters]
): Promise<FeatureAdoptionResult> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

function formatResult(
  parameters: FeatureAdoptionParameters,
  totals: Record<string, any>,
  series: Array<Record<string, any>>,
): FeatureAdoptionResult {
  const activeUsers = Number(totals?.activeUsers) || 0;
  const featureUsers = Number(totals?.featureUsers) || 0;
  const newUsers = Number(totals?.newUsers) || 0;
  const completedUsers = Number(totals?.completedUsers) || 0;

  return {
    feature: parameters.feature,
    successEvent: parameters.successEvent ?? null,
    activeUsers,
    featureUsers,
    newUsers,
    returningUsers: Math.max(featureUsers - newUsers, 0),
    adoptionRate: activeUsers > 0 ? (featureUsers / activeUsers) * 100 : 0,
    completedUsers,
    completionRate: featureUsers > 0 ? (completedUsers / featureUsers) * 100 : 0,
    series: (series ?? []).map(row => {
      const dayFeatureUsers = Number(row.featureUsers) || 0;
      const dayNewUsers = Number(row.newUsers) || 0;

      return {
        date: row.date,
        featureUsers: dayFeatureUsers,
        newUsers: dayNewUsers,
        returningUsers: Math.max(dayFeatureUsers - dayNewUsers, 0),
      };
    }),
  };
}

async function relationalQuery(
  websiteId: string,
  parameters: FeatureAdoptionParameters,
  filters: QueryFilters,
): Promise<FeatureAdoptionResult> {
  const { startDate, endDate, feature, successEvent, window = 60 } = parameters;
  const timezone = parameters.timezone ?? filters.timezone ?? 'utc';
  const unit = parameters.unit ?? filters.unit ?? 'day';
  const { getDateSQL, getAddIntervalQuery, parseFilters, rawQuery } = prisma;

  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    timezone,
  });

  const params = { ...queryParams, feature, ...(successEvent ? { successEvent } : {}) };

  const completionSelect = successEvent
    ? `,
      (select count(distinct fc.session_id)
        from (
          select website_event.session_id as session_id,
            min(website_event.created_at) as start_at
          from website_event
          where website_event.website_id = {{websiteId::uuid}}
            and website_event.created_at between {{startDate}} and {{endDate}}
            and website_event.event_name = {{feature}}
          group by website_event.session_id
        ) fc
        join website_event se
          on se.website_id = {{websiteId::uuid}}
          and se.session_id = fc.session_id
          and se.event_name = {{successEvent}}
          and se.created_at >= fc.start_at
          and se.created_at <= ${getAddIntervalQuery('fc.start_at', `${window} minute`)}
      ) as "completedUsers"`
    : `,
      0 as "completedUsers"`;

  const totals = await rawQuery(
    `
    WITH feature_sessions AS (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_name = {{feature}}
        ${filterQuery}
    ),
    active_sessions AS (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
    ),
    first_use AS (
      select website_event.session_id,
        min(website_event.created_at) as first_used_at
      from website_event
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.event_name = {{feature}}
      group by website_event.session_id
    )
    select
      (select count(*) from active_sessions) as "activeUsers",
      (select count(*) from feature_sessions) as "featureUsers",
      (select count(*)
        from feature_sessions f
        join first_use u on u.session_id = f.session_id
        where u.first_used_at between {{startDate}} and {{endDate}}) as "newUsers"
      ${completionSelect}
    `,
    params,
    'getFeatureAdoption',
  );

  const series = await rawQuery(
    `
    WITH first_use AS (
      select website_event.session_id as session_id,
        min(website_event.created_at) as first_used_at
      from website_event
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.event_name = {{feature}}
      group by website_event.session_id
    )
    select
      ${getDateSQL('website_event.created_at', unit, timezone)} as date,
      count(distinct website_event.session_id) as "featureUsers",
      count(distinct case
        when ${getDateSQL('u.first_used_at', unit, timezone)} = ${getDateSQL(
          'website_event.created_at',
          unit,
          timezone,
        )}
        then website_event.session_id end) as "newUsers"
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    join first_use u on u.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_name = {{feature}}
      ${filterQuery}
    group by 1
    order by 1
    `,
    params,
    'getFeatureAdoption',
  );

  return formatResult(
    parameters,
    (totals as Array<Record<string, any>>)?.[0] ?? {},
    (series ?? []) as Array<Record<string, any>>,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: FeatureAdoptionParameters,
  filters: QueryFilters,
): Promise<FeatureAdoptionResult> {
  const { startDate, endDate, feature, successEvent, window = 60 } = parameters;
  const timezone = parameters.timezone ?? filters.timezone ?? 'UTC';
  const unit = parameters.unit ?? filters.unit ?? 'day';
  const { getDateSQL, parseFilters, rawQuery } = clickhouse;

  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    timezone,
  });

  const params = { ...queryParams, feature, ...(successEvent ? { successEvent } : {}) };

  const completionSelect = successEvent
    ? `,
      (select uniq(fc.session_id)
        from (
          select session_id, min(created_at) as start_at
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
            and event_name = {feature:String}
          group by session_id
        ) fc
        inner join website_event se
          on se.website_id = {websiteId:UUID}
          and se.session_id = fc.session_id
          and se.event_name = {successEvent:String}
          and se.created_at >= fc.start_at
          and se.created_at <= fc.start_at + interval ${window} minute
      ) as completedUsers`
    : `,
      0 as completedUsers`;

  const totals = await rawQuery(
    `
    WITH feature_sessions AS (
      select distinct session_id
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_name = {feature:String}
        ${filterQuery}
    ),
    active_sessions AS (
      select distinct session_id
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
    ),
    first_use AS (
      select session_id,
        min(created_at) as first_used_at
      from website_event
      where website_id = {websiteId:UUID}
        and event_name = {feature:String}
      group by session_id
    )
    select
      (select count() from active_sessions) as activeUsers,
      (select count() from feature_sessions) as featureUsers,
      (select count()
        from feature_sessions f
        inner join first_use u on u.session_id = f.session_id
        where u.first_used_at between {startDate:DateTime64} and {endDate:DateTime64}) as newUsers
      ${completionSelect}
    `,
    params,
    'getFeatureAdoption',
  );

  const series = await rawQuery(
    `
    WITH first_use AS (
      select session_id,
        min(created_at) as first_used_at
      from website_event
      where website_id = {websiteId:UUID}
        and event_name = {feature:String}
      group by session_id
    )
    select
      ${getDateSQL('website_event.created_at', unit, timezone)} as date,
      uniq(website_event.session_id) as featureUsers,
      uniqIf(website_event.session_id, ${getDateSQL('u.first_used_at', unit, timezone)} = ${getDateSQL(
        'website_event.created_at',
        unit,
        timezone,
      )}) as newUsers
    from website_event
    ${cohortQuery}
    inner join first_use u on u.session_id = website_event.session_id
    where website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and website_event.event_name = {feature:String}
      ${filterQuery}
    group by 1
    order by 1
    `,
    params,
    'getFeatureAdoption',
  );

  return formatResult(
    parameters,
    (totals as Array<Record<string, any>>)?.[0] ?? {},
    (series ?? []) as Array<Record<string, any>>,
  );
}
