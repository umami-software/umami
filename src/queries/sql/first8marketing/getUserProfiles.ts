import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface UserProfilesParameters {
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export interface UserProfileData {
  user_id: string;
  lifecycle_stage: string;
  funnel_position: string;
  session_count: number;
  total_pageviews: number;
  total_purchases: number;
  total_revenue: number;
  avg_session_duration: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
  bounce_rate: number;
  favorite_categories: any;
  favorite_products: any;
  price_sensitivity: string;
  device_preference: string;
  first_visit: Date;
  last_visit: Date;
}

export async function getUserProfiles(
  params: UserProfilesParameters,
): Promise<UserProfileData[]> {
  return runQuery({
    [PRISMA]: () => getUserProfilesPostgres(params),
    [CLICKHOUSE]: () => getUserProfilesPostgres(params),
  });
}

async function getUserProfilesPostgres(
  params: UserProfilesParameters,
): Promise<UserProfileData[]> {
  const { rawQuery } = prisma;

  const profiles = await rawQuery(
    `
    select
      user_id,
      lifecycle_stage,
      funnel_position,
      session_count,
      total_pageviews,
      total_purchases,
      total_revenue,
      avg_session_duration,
      avg_time_on_page,
      avg_scroll_depth,
      bounce_rate,
      favorite_categories,
      favorite_products,
      price_sensitivity,
      device_preference,
      first_visit,
      last_visit
    from user_profiles
    where website_id = {{websiteId::uuid}}
      and last_visit between {{startDate}} and {{endDate}}
    order by total_revenue desc, last_visit desc
    limit 100
  `,
    params,
  );

  return profiles.map((row: any) => ({
    user_id: row.user_id,
    lifecycle_stage: row.lifecycle_stage,
    funnel_position: row.funnel_position,
    session_count: Number(row.session_count),
    total_pageviews: Number(row.total_pageviews),
    total_purchases: Number(row.total_purchases),
    total_revenue: Number(row.total_revenue),
    avg_session_duration: Number(row.avg_session_duration),
    avg_time_on_page: Number(row.avg_time_on_page),
    avg_scroll_depth: Number(row.avg_scroll_depth),
    bounce_rate: Number(row.bounce_rate),
    favorite_categories: row.favorite_categories,
    favorite_products: row.favorite_products,
    price_sensitivity: row.price_sensitivity,
    device_preference: row.device_preference,
    first_visit: row.first_visit,
    last_visit: row.last_visit,
  }));
}

