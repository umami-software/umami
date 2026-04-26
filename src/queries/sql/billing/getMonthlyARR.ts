import { PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { MonthlyARR } from '@/lib/stripe';

const FUNCTION_NAME = 'getMonthlyARR';

export async function getMonthlyARR(
  ...args: [providerId: string, startDate: Date, endDate: Date]
): Promise<MonthlyARR[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
  });
}

async function relationalQuery(
  providerId: string,
  startDate: Date,
  endDate: Date,
): Promise<MonthlyARR[]> {
  const { rawQuery } = prisma;

  const rows = await rawQuery(
    `
    WITH

    -- Licensed lines: spread mrr_cents (= amount_cents / period_months) across each covered month.
    -- Matches JS: mrrPerMonth = line.amount / 100 / periodMonths, added to each month in the window.
    licensed_by_month AS (
      SELECT
        bil.customer_id,
        date_trunc('month', gs.m)::timestamptz AS month_start,
        SUM(bil.mrr_cents)                     AS base_cents
      FROM billing_invoice bil
      CROSS JOIN LATERAL generate_series(
        date_trunc('month', bil.period_start),
        date_trunc('month', bil.period_start) + ((bil.period_months - 1) * interval '1 month'),
        interval '1 month'
      ) AS gs(m)
      WHERE bil.invoice_status = 'paid'
        AND bil.usage_type = 'licensed'
        AND bil.provider_id = {{providerId}}::uuid
      GROUP BY bil.customer_id, date_trunc('month', gs.m)
    ),

    -- Metered lines: full amount_cents allocated to the invoice's period_end month.
    -- Matches JS: add(customerId, toMonthKey(invoice.period_end), 0, line.amount / 100)
    metered_by_month AS (
      SELECT
        bil.customer_id,
        date_trunc('month', bil.invoice_period_end)::timestamptz AS month_start,
        SUM(bil.amount_cents)                                     AS usage_cents
      FROM billing_invoice bil
      WHERE bil.invoice_status = 'paid'
        AND bil.usage_type = 'metered'
        AND bil.provider_id = {{providerId}}::uuid
      GROUP BY bil.customer_id, date_trunc('month', bil.invoice_period_end)
    ),

    -- One-time lines: full amount_cents allocated to the invoice's period_end month.
    -- Matches JS: add(customerId, toMonthKey(invoice.period_end), 0, 0, line.amount / 100)
    one_time_by_month AS (
      SELECT
        bil.customer_id,
        date_trunc('month', bil.invoice_period_end)::timestamptz AS month_start,
        SUM(bil.amount_cents)                                     AS one_time_cents
      FROM billing_invoice bil
      WHERE bil.invoice_status = 'paid'
        AND bil.usage_type = 'one_time'
        AND bil.provider_id = {{providerId}}::uuid
      GROUP BY bil.customer_id, date_trunc('month', bil.invoice_period_end)
    ),

    -- Merge all sources into a single (customer, month) table.
    customer_month AS (
      SELECT
        customer_id,
        month_start,
        SUM(base_cents)     AS base_cents,
        SUM(usage_cents)    AS usage_cents,
        SUM(one_time_cents) AS one_time_cents
      FROM (
        SELECT customer_id, month_start, base_cents, 0 AS usage_cents, 0 AS one_time_cents FROM licensed_by_month
        UNION ALL
        SELECT customer_id, month_start, 0, usage_cents, 0 FROM metered_by_month
        UNION ALL
        SELECT customer_id, month_start, 0, 0, one_time_cents FROM one_time_by_month
      ) all_lines
      GROUP BY customer_id, month_start
    ),

    -- "Active" in a month = has licensed base > 0. Mirrors JS getActiveCustomers() filter.
    active AS (
      SELECT customer_id, month_start, base_cents, usage_cents, one_time_cents
      FROM customer_month
      WHERE base_cents > 0
    ),

    -- First month each customer ever had base > 0 (new vs. resurrected classification).
    first_active AS (
      SELECT customer_id, MIN(month_start) AS first_month
      FROM active
      GROUP BY customer_id
    ),

    -- Per-customer movement: each active row paired with its prior month's state.
    -- FULL OUTER JOIN produces:
    --   matched row  → customer retained/expanded/contracted
    --   unmatched cur → customer new or resurrected (no prior base)
    --   unmatched prev → customer churned (was active, now absent)
    movement AS (
      SELECT
        COALESCE(cur.month_start, prev.month_start + interval '1 month') AS month_start,
        COALESCE(cur.customer_id, prev.customer_id)                      AS customer_id,
        COALESCE(cur.base_cents, 0)                                      AS cur_base,
        COALESCE(cur.usage_cents, 0)                                     AS cur_usage,
        COALESCE(cur.one_time_cents, 0)                                  AS cur_one_time,
        COALESCE(prev.base_cents + prev.usage_cents, 0)                  AS prev_total,
        fa.first_month
      FROM active cur
      FULL OUTER JOIN active prev
        ON  prev.customer_id = cur.customer_id
        AND prev.month_start = cur.month_start - interval '1 month'
      LEFT JOIN first_active fa
        ON fa.customer_id = COALESCE(cur.customer_id, prev.customer_id)
    ),

    -- Aggregate waterfall buckets per month.
    waterfall AS (
      SELECT
        month_start,
        ROUND(SUM(cur_base + cur_usage) / 100.0, 2) AS total_sales,
        ROUND(SUM(cur_one_time) / 100.0, 2) AS non_recurring,
        ROUND(SUM(CASE
          WHEN cur_base > 0 AND prev_total = 0 AND first_month = month_start
          THEN cur_base + cur_usage ELSE 0
        END) / 100.0, 2) AS new_sales,
        ROUND(SUM(CASE
          WHEN cur_base > 0 AND prev_total > 0
          THEN cur_base + cur_usage ELSE 0
        END) / 100.0, 2) AS retained,
        ROUND(SUM(CASE
          WHEN cur_base > 0 AND prev_total = 0 AND first_month < month_start
          THEN cur_base + cur_usage ELSE 0
        END) / 100.0, 2) AS resurrected,
        ROUND(SUM(CASE
          WHEN cur_base > 0 AND prev_total > 0 AND (cur_base + cur_usage) > prev_total
          THEN (cur_base + cur_usage) - prev_total ELSE 0
        END) / 100.0, 2) AS expansion,
        ROUND(SUM(CASE
          WHEN cur_base > 0 AND prev_total > 0 AND (cur_base + cur_usage) < prev_total
          THEN (cur_base + cur_usage) - prev_total ELSE 0
        END) / 100.0, 2) AS contraction,
        ROUND(SUM(CASE
          WHEN cur_base = 0 AND prev_total > 0
          THEN -prev_total ELSE 0
        END) / 100.0, 2) AS churned
      FROM movement
      GROUP BY month_start
    ),

    -- Month spine: every month from startDate through endDate (inclusive), so the result
    -- always has a row per month even when there is no billing activity.
    months AS (
      SELECT generate_series(
        date_trunc('month', {{startDate}}::timestamptz),
        date_trunc('month', {{endDate}}::timestamptz),
        interval '1 month'
      )::timestamptz AS month_start
    )

    SELECT
      to_char(m.month_start, 'YYYY-MM') AS month,
      COALESCE(w.total_sales,   0) AS "totalSales",
      COALESCE(w.non_recurring, 0) AS "nonRecurring",
      COALESCE(w.new_sales,     0) AS "newSales",
      COALESCE(w.retained,      0) AS "retained",
      COALESCE(w.resurrected,   0) AS "resurrected",
      COALESCE(w.expansion,     0) AS "expansion",
      COALESCE(w.contraction,   0) AS "contraction",
      COALESCE(w.churned,       0) AS "churned"
    FROM months m
    LEFT JOIN waterfall w ON w.month_start = m.month_start
    ORDER BY m.month_start
    `,
    { providerId, startDate, endDate },
    FUNCTION_NAME,
  );

  // NUMERIC columns returned by the driver are strings; cast them back to numbers.
  return (rows as any[]).map(r => ({
    month: r.month as string,
    totalSales: Number(r.totalSales),
    nonRecurring: Number(r.nonRecurring),
    newSales: Number(r.newSales),
    retained: Number(r.retained),
    resurrected: Number(r.resurrected),
    expansion: Number(r.expansion),
    contraction: Number(r.contraction),
    churned: Number(r.churned),
  }));
}
