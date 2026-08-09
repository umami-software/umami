import prisma from '@/lib/prisma';
import type { MonthlyARR } from '@/lib/stripe';

const FUNCTION_NAME = 'getMonthlyARR';

// billing_invoice only exists in Postgres, so this bypasses the ClickHouse/Prisma
// runQuery dispatch used by analytics queries that can live in either backend.
export async function getMonthlyARR(
  billingId: string,
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
        AND bil.billing_id = {{billingId}}::uuid
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
        AND bil.billing_id = {{billingId}}::uuid
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
        AND bil.billing_id = {{billingId}}::uuid
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

    -- "Active" in a month = has licensed base > 0, before accounting for invoice sync lag.
    real_active AS (
      SELECT customer_id, month_start, base_cents, usage_cents, one_time_cents
      FROM customer_month
      WHERE base_cents > 0
    ),

    -- Expected next-invoice date per customer: period_end of their most recent paid
    -- licensed invoice. Used to gate the carry-forward grace below.
    last_licensed_invoice AS (
      SELECT DISTINCT ON (bil.customer_id)
        bil.customer_id,
        bil.period_end AS next_invoice_date
      FROM billing_invoice bil
      WHERE bil.invoice_status = 'paid'
        AND bil.usage_type = 'licensed'
        AND bil.billing_id = {{billingId}}::uuid
      ORDER BY bil.customer_id, bil.period_start DESC
    ),

    -- For the current (most recent, still-in-progress) month in the query range only:
    -- if a customer had no invoice at all yet this month, but their next invoice isn't
    -- due yet, assume they continue at last month's charge and usage. Once endDate
    -- reaches their next_invoice_date with still nothing posted, this stops firing and
    -- they fall through to the churned bucket via the movement CTE below.
    carried_forward AS (
      SELECT
        ra.customer_id,
        date_trunc('month', {{endDate}}::timestamptz) AS month_start,
        ra.base_cents,
        ra.usage_cents,
        0 AS one_time_cents
      FROM real_active ra
      JOIN last_licensed_invoice lli ON lli.customer_id = ra.customer_id
      WHERE ra.month_start = date_trunc('month', {{endDate}}::timestamptz) - interval '1 month'
        AND lli.next_invoice_date > {{endDate}}::timestamptz
        AND NOT EXISTS (
          SELECT 1 FROM customer_month cm
          WHERE cm.customer_id = ra.customer_id
            AND cm.month_start = date_trunc('month', {{endDate}}::timestamptz)
        )
    ),

    customer_month_all AS (
      SELECT * FROM customer_month
      UNION ALL
      SELECT * FROM carried_forward
    ),

    -- "Active" in a month = has licensed base > 0. Mirrors JS getActiveCustomers() filter,
    -- now including invoices assumed carried forward for the current month (see above).
    active AS (
      SELECT customer_id, month_start, base_cents, usage_cents, one_time_cents
      FROM customer_month_all
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
    { billingId, startDate, endDate },
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
