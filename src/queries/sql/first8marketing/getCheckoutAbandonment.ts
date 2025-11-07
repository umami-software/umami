import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface CheckoutAbandonmentParameters {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export interface CheckoutAbandonmentStep {
  step: string;
  count: number;
  drop_off_rate: number;
}

export interface CheckoutAbandonmentData {
  steps: CheckoutAbandonmentStep[];
  total_cart_views: number;
  total_checkout_started: number;
  total_payment_info: number;
  total_purchases: number;
  overall_abandonment_rate: number;
}

export async function getCheckoutAbandonment(
  params: CheckoutAbandonmentParameters,
): Promise<CheckoutAbandonmentData> {
  const { websiteId, startDate, endDate } = params;

  const queryParams = {
    websiteId,
    startDate,
    endDate,
  };

  return runQuery({
    [PRISMA]: () => getCheckoutAbandonmentPostgres(queryParams),
    [CLICKHOUSE]: () => getCheckoutAbandonmentPostgres(queryParams),
  });
}

async function getCheckoutAbandonmentPostgres(
  params: any,
): Promise<CheckoutAbandonmentData> {
  const { websiteId, startDate, endDate } = params;
  const { rawQuery } = prisma;

  const steps = await rawQuery(
    `
    with checkout_data as (
      select
        count(*) filter (where event_name = 'cart_view') as cart_views,
        count(*) filter (where event_name = 'checkout_started') as checkout_started,
        count(*) filter (where event_name = 'payment_info_entered') as payment_info,
        count(*) filter (where event_name = 'purchase') as purchases
      from website_event
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
    )
    select
      'Cart View' as step, cart_views as count, 0.0 as drop_off_rate
    from checkout_data
    union all
    select
      'Checkout Started' as step, checkout_started as count,
      case when cart_views > 0 then ((cart_views - checkout_started)::float / cart_views * 100) else 0 end as drop_off_rate
    from checkout_data
    union all
    select
      'Payment Info' as step, payment_info as count,
      case when checkout_started > 0 then ((checkout_started - payment_info)::float / checkout_started * 100) else 0 end as drop_off_rate
    from checkout_data
    union all
    select
      'Purchase' as step, purchases as count,
      case when payment_info > 0 then ((payment_info - purchases)::float / payment_info * 100) else 0 end as drop_off_rate
    from checkout_data
    order by
      case step
        when 'Cart View' then 1
        when 'Checkout Started' then 2
        when 'Payment Info' then 3
        when 'Purchase' then 4
      end
  `,
    params,
  );

  const cart_views = steps[0] ? Number(steps[0].count) : 0;
  const purchases = steps[3] ? Number(steps[3].count) : 0;
  const overall_abandonment_rate =
    cart_views > 0 ? ((cart_views - purchases) / cart_views) * 100 : 0;

  return {
    steps: steps.map((row: any) => ({
      step: row.step,
      count: Number(row.count),
      drop_off_rate: Number(row.drop_off_rate),
    })),
    total_cart_views: cart_views,
    total_checkout_started: steps[1] ? Number(steps[1].count) : 0,
    total_payment_info: steps[2] ? Number(steps[2].count) : 0,
    total_purchases: purchases,
    overall_abandonment_rate,
  };
}

