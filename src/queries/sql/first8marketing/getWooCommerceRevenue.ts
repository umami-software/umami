import { PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface WooCommerceRevenueParameters {
  startDate: Date;
  endDate: Date;
  unit: string;
  timezone: string;
}

export interface WooCommerceRevenueResult {
  chart: { x: string; t: string; y: number }[];
  products: { product_id: string; revenue: number; orders: number }[];
  categories: { category_id: string; revenue: number; orders: number }[];
  total: { sum: number; count: number; average: number; cart_abandonment_rate: number };
}

export async function getWooCommerceRevenue(
  ...args: [websiteId: string, parameters: WooCommerceRevenueParameters, filters: QueryFilters]
): Promise<WooCommerceRevenueResult> {
  return runQuery({
    [PRISMA]: () => getWooCommerceRevenuePostgres(...args),
  });
}

async function getWooCommerceRevenuePostgres(
  websiteId: string,
  parameters: WooCommerceRevenueParameters,
  filters: QueryFilters,
): Promise<WooCommerceRevenueResult> {
  const { rawQuery } = prisma;
  const { startDate, endDate, unit, timezone } = parameters;

  const params = {
    websiteId,
    startDate,
    endDate,
    unit,
    timezone,
  };

  // Chart data - revenue over time
  const chartData = await rawQuery(
    `
    select
      date_trunc({{unit}}, created_at) as x,
      to_char(date_trunc({{unit}}, created_at), 'YYYY-MM-DD HH24:MI:SS') as t,
      coalesce(sum((event_data->>'revenue')::numeric), 0) as y
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_name = 'purchase'
      and event_data->>'revenue' is not null
    group by date_trunc({{unit}}, created_at)
    order by x
  `,
    params,
  );

  // Top products by revenue
  const products = await rawQuery(
    `
    select
      coalesce(event_data->>'product_id', 'unknown') as product_id,
      coalesce(sum((event_data->>'revenue')::numeric), 0) as revenue,
      count(*) as orders
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_name = 'purchase'
      and event_data->>'product_id' is not null
    group by event_data->>'product_id'
    order by revenue desc
    limit 10
  `,
    params,
  );

  // Top categories by revenue
  const categories = await rawQuery(
    `
    select
      coalesce(event_data->>'category_id', 'unknown') as category_id,
      coalesce(sum((event_data->>'revenue')::numeric), 0) as revenue,
      count(*) as orders
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_name = 'purchase'
      and event_data->>'category_id' is not null
    group by event_data->>'category_id'
    order by revenue desc
    limit 10
  `,
    params,
  );

  // Total revenue and stats
  const totalData = await rawQuery(
    `
    select
      coalesce(sum((event_data->>'revenue')::numeric), 0) as sum,
      count(*) as count,
      case when count(*) > 0
        then coalesce(sum((event_data->>'revenue')::numeric), 0) / count(*)
        else 0
      end as average,
      (
        select
          case when count(*) filter (where event_name = 'add_to_cart') > 0
            then (1 - (count(*) filter (where event_name = 'purchase')::float /
                       count(*) filter (where event_name = 'add_to_cart'))) * 100
            else 0
          end
        from website_event
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
          and event_name in ('add_to_cart', 'purchase')
      ) as cart_abandonment_rate
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_name = 'purchase'
  `,
    params,
  );

  const total = totalData[0] || { sum: 0, count: 0, average: 0, cart_abandonment_rate: 0 };

  return {
    chart: chartData.map((row: any) => ({
      x: row.x,
      t: row.t,
      y: Number(row.y),
    })),
    products: products.map((row: any) => ({
      product_id: row.product_id,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
    })),
    categories: categories.map((row: any) => ({
      category_id: row.category_id,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
    })),
    total: {
      sum: Number(total.sum),
      count: Number(total.count),
      average: Number(total.average),
      cart_abandonment_rate: Number(total.cart_abandonment_rate),
    },
  };
}

