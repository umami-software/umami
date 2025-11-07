import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface RecommendationPerformanceParameters {
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export interface PerformanceByStrategy {
  strategy: string;
  total_shown: number;
  total_clicked: number;
  total_converted: number;
  ctr: number;
  conversion_rate: number;
  total_revenue: number;
  avg_revenue_per_recommendation: number;
}

export interface PerformanceByModelVersion {
  model_version: string;
  total_shown: number;
  total_clicked: number;
  total_converted: number;
  ctr: number;
  conversion_rate: number;
  total_revenue: number;
}

export interface PerformanceByType {
  recommendation_type: string;
  total_shown: number;
  total_clicked: number;
  total_converted: number;
  ctr: number;
  conversion_rate: number;
  total_revenue: number;
}

export interface RecommendationPerformanceData {
  by_strategy: PerformanceByStrategy[];
  by_model_version: PerformanceByModelVersion[];
  by_type: PerformanceByType[];
  summary: {
    total_recommendations: number;
    total_clicks: number;
    total_conversions: number;
    overall_ctr: number;
    overall_conversion_rate: number;
    total_revenue: number;
  };
}

export async function getRecommendationPerformance(
  params: RecommendationPerformanceParameters,
): Promise<RecommendationPerformanceData> {
  return runQuery({
    [PRISMA]: () => getRecommendationPerformancePostgres(params),
    [CLICKHOUSE]: () => getRecommendationPerformancePostgres(params),
  });
}

async function getRecommendationPerformancePostgres(
  params: RecommendationPerformanceParameters,
): Promise<RecommendationPerformanceData> {
  const { rawQuery } = prisma;

  // Performance by strategy
  const by_strategy = await rawQuery(
    `
    select
      strategy,
      count(*) as total_shown,
      count(*) filter (where clicked = true) as total_clicked,
      count(*) filter (where converted = true) as total_converted,
      case when count(*) > 0
        then (count(*) filter (where clicked = true)::float / count(*) * 100)
        else 0 end as ctr,
      case when count(*) > 0
        then (count(*) filter (where converted = true)::float / count(*) * 100)
        else 0 end as conversion_rate,
      coalesce(sum(revenue), 0) as total_revenue,
      case when count(*) > 0
        then coalesce(sum(revenue), 0) / count(*)
        else 0 end as avg_revenue_per_recommendation
    from recommendations
    where website_id = {{websiteId::uuid}}
      and shown_at between {{startDate}} and {{endDate}}
    group by strategy
    order by total_revenue desc
  `,
    params,
  );

  // Performance by model version
  const by_model_version = await rawQuery(
    `
    select
      model_version,
      count(*) as total_shown,
      count(*) filter (where clicked = true) as total_clicked,
      count(*) filter (where converted = true) as total_converted,
      case when count(*) > 0
        then (count(*) filter (where clicked = true)::float / count(*) * 100)
        else 0 end as ctr,
      case when count(*) > 0
        then (count(*) filter (where converted = true)::float / count(*) * 100)
        else 0 end as conversion_rate,
      coalesce(sum(revenue), 0) as total_revenue
    from recommendations
    where website_id = {{websiteId::uuid}}
      and shown_at between {{startDate}} and {{endDate}}
    group by model_version
    order by total_revenue desc
    limit 20
  `,
    params,
  );

  // Performance by type
  const by_type = await rawQuery(
    `
    select
      recommendation_type,
      count(*) as total_shown,
      count(*) filter (where clicked = true) as total_clicked,
      count(*) filter (where converted = true) as total_converted,
      case when count(*) > 0
        then (count(*) filter (where clicked = true)::float / count(*) * 100)
        else 0 end as ctr,
      case when count(*) > 0
        then (count(*) filter (where converted = true)::float / count(*) * 100)
        else 0 end as conversion_rate,
      coalesce(sum(revenue), 0) as total_revenue
    from recommendations
    where website_id = {{websiteId::uuid}}
      and shown_at between {{startDate}} and {{endDate}}
    group by recommendation_type
    order by total_revenue desc
  `,
    params,
  );

  // Summary
  const summary_result = await rawQuery(
    `
    select
      count(*) as total_recommendations,
      count(*) filter (where clicked = true) as total_clicks,
      count(*) filter (where converted = true) as total_conversions,
      case when count(*) > 0
        then (count(*) filter (where clicked = true)::float / count(*) * 100)
        else 0 end as overall_ctr,
      case when count(*) > 0
        then (count(*) filter (where converted = true)::float / count(*) * 100)
        else 0 end as overall_conversion_rate,
      coalesce(sum(revenue), 0) as total_revenue
    from recommendations
    where website_id = {{websiteId::uuid}}
      and shown_at between {{startDate}} and {{endDate}}
  `,
    params,
  );

  const summary_row = summary_result[0] || {};

  return {
    by_strategy: by_strategy.map((row: any) => ({
      strategy: row.strategy,
      total_shown: Number(row.total_shown),
      total_clicked: Number(row.total_clicked),
      total_converted: Number(row.total_converted),
      ctr: Number(row.ctr),
      conversion_rate: Number(row.conversion_rate),
      total_revenue: Number(row.total_revenue),
      avg_revenue_per_recommendation: Number(row.avg_revenue_per_recommendation),
    })),
    by_model_version: by_model_version.map((row: any) => ({
      model_version: row.model_version,
      total_shown: Number(row.total_shown),
      total_clicked: Number(row.total_clicked),
      total_converted: Number(row.total_converted),
      ctr: Number(row.ctr),
      conversion_rate: Number(row.conversion_rate),
      total_revenue: Number(row.total_revenue),
    })),
    by_type: by_type.map((row: any) => ({
      recommendation_type: row.recommendation_type,
      total_shown: Number(row.total_shown),
      total_clicked: Number(row.total_clicked),
      total_converted: Number(row.total_converted),
      ctr: Number(row.ctr),
      conversion_rate: Number(row.conversion_rate),
      total_revenue: Number(row.total_revenue),
    })),
    summary: {
      total_recommendations: Number(summary_row.total_recommendations || 0),
      total_clicks: Number(summary_row.total_clicks || 0),
      total_conversions: Number(summary_row.total_conversions || 0),
      overall_ctr: Number(summary_row.overall_ctr || 0),
      overall_conversion_rate: Number(summary_row.overall_conversion_rate || 0),
      total_revenue: Number(summary_row.total_revenue || 0),
    },
  };
}

