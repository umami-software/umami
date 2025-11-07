import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface ProductPerformanceParameters {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export interface ProductPerformanceRow {
  product_id: string;
  views: number;
  add_to_cart: number;
  purchases: number;
  add_to_cart_rate: number;
  conversion_rate: number;
  revenue: number;
  revenue_per_view: number;
}

export async function getProductPerformance(
  params: ProductPerformanceParameters,
): Promise<ProductPerformanceRow[]> {
  const { websiteId, startDate, endDate } = params;

  const queryParams = {
    websiteId,
    startDate,
    endDate,
  };

  return runQuery({
    [PRISMA]: () => getProductPerformancePostgres(queryParams),
    [CLICKHOUSE]: () => getProductPerformancePostgres(queryParams),
  });
}

async function getProductPerformancePostgres(params: any): Promise<ProductPerformanceRow[]> {
  const { websiteId, startDate, endDate } = params;
  const { rawQuery } = prisma;

  const products = await rawQuery(
    `
    select
      coalesce(event_data->>'product_id', 'unknown') as product_id,
      count(*) filter (where event_name = 'product_view') as views,
      count(*) filter (where event_name = 'add_to_cart') as add_to_cart,
      count(*) filter (where event_name = 'purchase') as purchases,
      case when count(*) filter (where event_name = 'product_view') > 0
        then (count(*) filter (where event_name = 'add_to_cart')::float /
              count(*) filter (where event_name = 'product_view') * 100)
        else 0
      end as add_to_cart_rate,
      case when count(*) filter (where event_name = 'product_view') > 0
        then (count(*) filter (where event_name = 'purchase')::float /
              count(*) filter (where event_name = 'product_view') * 100)
        else 0
      end as conversion_rate,
      coalesce(sum(
        case when event_name = 'purchase' and event_data->>'revenue' is not null
          then (event_data->>'revenue')::numeric
          else 0
        end
      ), 0) as revenue,
      case when count(*) filter (where event_name = 'product_view') > 0
        then coalesce(sum(
          case when event_name = 'purchase' and event_data->>'revenue' is not null
            then (event_data->>'revenue')::numeric
            else 0
          end
        ), 0) / count(*) filter (where event_name = 'product_view')
        else 0
      end as revenue_per_view
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_data->>'product_id' is not null
    group by event_data->>'product_id'
    order by revenue desc
    limit 50
  `,
    params,
  );

  return products.map((row: any) => ({
    product_id: row.product_id,
    views: Number(row.views),
    add_to_cart: Number(row.add_to_cart),
    purchases: Number(row.purchases),
    add_to_cart_rate: Number(row.add_to_cart_rate),
    conversion_rate: Number(row.conversion_rate),
    revenue: Number(row.revenue),
    revenue_per_view: Number(row.revenue_per_view),
  }));
}

