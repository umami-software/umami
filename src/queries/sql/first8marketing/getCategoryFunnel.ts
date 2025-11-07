import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface CategoryFunnelParameters {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export interface CategoryFunnelStep {
  step: string;
  count: number;
  conversion_rate: number;
}

export interface CategoryFunnelData {
  funnel: CategoryFunnelStep[];
  total_category_views: number;
  total_product_views: number;
  total_add_to_cart: number;
  total_checkout_started: number;
  total_purchases: number;
}

export async function getCategoryFunnel(
  params: CategoryFunnelParameters,
): Promise<CategoryFunnelData> {
  const { websiteId, startDate, endDate } = params;

  const queryParams = {
    websiteId,
    startDate,
    endDate,
  };

  return runQuery({
    [PRISMA]: () => getCategoryFunnelPostgres(queryParams),
    [CLICKHOUSE]: () => getCategoryFunnelPostgres(queryParams),
  });
}

async function getCategoryFunnelPostgres(params: any): Promise<CategoryFunnelData> {
  const { websiteId, startDate, endDate } = params;
  const { rawQuery } = prisma;

  const funnel = await rawQuery(
    `
    with funnel_data as (
      select
        count(*) filter (where event_name = 'category_view') as category_views,
        count(*) filter (where event_name = 'product_view') as product_views,
        count(*) filter (where event_name = 'add_to_cart') as add_to_cart,
        count(*) filter (where event_name = 'checkout_started') as checkout_started,
        count(*) filter (where event_name = 'purchase') as purchases
      from website_event
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
    )
    select
      'Category View' as step, category_views as count, 100.0 as conversion_rate
    from funnel_data
    union all
    select
      'Product View' as step, product_views as count,
      case when category_views > 0 then (product_views::float / category_views * 100) else 0 end as conversion_rate
    from funnel_data
    union all
    select
      'Add to Cart' as step, add_to_cart as count,
      case when product_views > 0 then (add_to_cart::float / product_views * 100) else 0 end as conversion_rate
    from funnel_data
    union all
    select
      'Checkout Started' as step, checkout_started as count,
      case when add_to_cart > 0 then (checkout_started::float / add_to_cart * 100) else 0 end as conversion_rate
    from funnel_data
    union all
    select
      'Purchase' as step, purchases as count,
      case when checkout_started > 0 then (purchases::float / checkout_started * 100) else 0 end as conversion_rate
    from funnel_data
    order by
      case step
        when 'Category View' then 1
        when 'Product View' then 2
        when 'Add to Cart' then 3
        when 'Checkout Started' then 4
        when 'Purchase' then 5
      end
  `,
    params,
  );

  const totals = funnel.length > 0 ? funnel[0] : null;

  return {
    funnel: funnel.map((row: any) => ({
      step: row.step,
      count: Number(row.count),
      conversion_rate: Number(row.conversion_rate),
    })),
    total_category_views: totals ? Number(totals.count) : 0,
    total_product_views: funnel[1] ? Number(funnel[1].count) : 0,
    total_add_to_cart: funnel[2] ? Number(funnel[2].count) : 0,
    total_checkout_started: funnel[3] ? Number(funnel[3].count) : 0,
    total_purchases: funnel[4] ? Number(funnel[4].count) : 0,
  };
}

