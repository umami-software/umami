import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import type { MonthlyMRR } from '@/lib/stripe';
import { getMRRRelational } from './getMRRRelational';

const FUNCTION_NAME = 'getMRR';

export async function getMRR(
  paymentProviderId: string,
  startDate: Date,
  endDate: Date,
): Promise<MonthlyMRR[]> {
  return runQuery({
    [PRISMA]: () => getMRRRelational(paymentProviderId, startDate, endDate),
    [CLICKHOUSE]: () => clickhouseQuery(paymentProviderId, startDate, endDate),
  });
}

// ClickHouse port of getMRRRelational.ts. Same CTE chain, same comments describing
// each step — kept side by side so the two can be diffed CTE-by-CTE to confirm they
// compute identical numbers. Postgres constructs with no direct ClickHouse equivalent
// are swapped for the ClickHouse idiom that reproduces the same semantics:
//   - `generate_series(...) CROSS JOIN LATERAL`  -> `arrayJoin(range(period_months))`
//   - `DISTINCT ON (customer_id) ORDER BY ... DESC` -> `ORDER BY ... DESC LIMIT 1 BY customer_id`
//   - `FULL OUTER JOIN`                          -> `FULL JOIN` (ClickHouse alias for the same)
// The FULL/LEFT JOINs below rely on `join_use_nulls = 1` (set at the end of the query)
// so an unmatched side comes back as SQL NULL — matching Postgres's OUTER JOIN behavior —
// rather than ClickHouse's default of filling in each column's zero value, which would
// silently break every `COALESCE(..., 0)` "is this row missing" check below.
async function clickhouseQuery(
  paymentProviderId: string,
  startDate: Date,
  endDate: Date,
): Promise<MonthlyMRR[]> {
  const { rawQuery } = clickhouse;

  const rows = await rawQuery(
    `
    WITH

    -- Licensed lines: spread mrr_cents across each covered month.
    -- Matches JS: mrrPerMonth = line.amount / 100 / periodMonths, added to each month in the window.
    licensed_by_month AS (
      SELECT
        customer_id,
        addMonths(toStartOfMonth(period_start), month_offset) AS month_start,
        SUM(mrr_cents) AS base_cents
      FROM (
        SELECT
          customer_id,
          period_start,
          mrr_cents,
          arrayJoin(range(period_months)) AS month_offset
        FROM payment_provider_invoice FINAL
        WHERE invoice_status = 'paid'
          AND usage_type = 'licensed'
          AND payment_provider_id = {paymentProviderId:UUID}
      )
      GROUP BY customer_id, month_start
    ),

    -- Metered lines: full amount_cents allocated to the invoice's period_end month.
    -- Matches JS: add(customerId, toMonthKey(invoice.period_end), 0, line.amount / 100)
    metered_by_month AS (
      SELECT
        customer_id,
        toStartOfMonth(invoice_period_end) AS month_start,
        SUM(amount_cents) AS usage_cents
      FROM payment_provider_invoice FINAL
      WHERE invoice_status = 'paid'
        AND usage_type = 'metered'
        AND payment_provider_id = {paymentProviderId:UUID}
      GROUP BY customer_id, month_start
    ),

    -- One-time lines: full amount_cents allocated to the invoice's period_end month.
    -- Matches JS: add(customerId, toMonthKey(invoice.period_end), 0, 0, line.amount / 100)
    one_time_by_month AS (
      SELECT
        customer_id,
        toStartOfMonth(invoice_period_end) AS month_start,
        SUM(amount_cents) AS one_time_cents
      FROM payment_provider_invoice FINAL
      WHERE invoice_status = 'paid'
        AND usage_type = 'one_time'
        AND payment_provider_id = {paymentProviderId:UUID}
      GROUP BY customer_id, month_start
    ),

    -- Merge all sources into a single (customer, month) table.
    customer_month AS (
      SELECT
        customer_id,
        month_start,
        SUM(base_cents) AS base_cents,
        SUM(usage_cents) AS usage_cents,
        SUM(one_time_cents) AS one_time_cents
      FROM (
        SELECT customer_id, month_start, base_cents, 0 AS usage_cents, 0 AS one_time_cents FROM licensed_by_month
        UNION ALL
        SELECT customer_id, month_start, 0, usage_cents, 0 FROM metered_by_month
        UNION ALL
        SELECT customer_id, month_start, 0, 0, one_time_cents FROM one_time_by_month
      )
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
      SELECT customer_id, period_end AS next_invoice_date
      FROM payment_provider_invoice FINAL
      WHERE invoice_status = 'paid'
        AND usage_type = 'licensed'
        AND payment_provider_id = {paymentProviderId:UUID}
      ORDER BY customer_id, period_start DESC
      LIMIT 1 BY customer_id
    ),

    -- For the current (most recent, still-in-progress) month in the query range only:
    -- if a customer had no invoice at all yet this month, but their next invoice isn't
    -- due yet, assume they continue at last month's charge and usage. Once endDate
    -- reaches their next_invoice_date with still nothing posted, this stops firing and
    -- they fall through to the churned bucket via the movement CTE below.
    carried_forward AS (
      SELECT
        ra.customer_id AS customer_id,
        toStartOfMonth({endDate:DateTime64}) AS month_start,
        ra.base_cents AS base_cents,
        ra.usage_cents AS usage_cents,
        0 AS one_time_cents
      FROM real_active ra
      INNER JOIN last_licensed_invoice lli ON lli.customer_id = ra.customer_id
      WHERE ra.month_start = addMonths(toStartOfMonth({endDate:DateTime64}), -1)
        AND lli.next_invoice_date > {endDate:DateTime64}
        AND (ra.customer_id, toStartOfMonth({endDate:DateTime64})) NOT IN (
          SELECT customer_id, month_start FROM customer_month
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
    -- FULL JOIN produces:
    --   matched row  -> customer retained/expanded/contracted
    --   unmatched cur -> customer new or resurrected (no prior base)
    --   unmatched prev -> customer churned (was active, now absent)
    movement AS (
      SELECT
        COALESCE(cur.month_start, addMonths(prev.month_start, 1)) AS month_start,
        COALESCE(cur.customer_id, prev.customer_id) AS customer_id,
        COALESCE(cur.base_cents, 0) AS cur_base,
        COALESCE(cur.usage_cents, 0) AS cur_usage,
        COALESCE(cur.one_time_cents, 0) AS cur_one_time,
        COALESCE(prev.base_cents, 0) + COALESCE(prev.usage_cents, 0) AS prev_total,
        fa.first_month AS first_month
      FROM active AS cur
      FULL JOIN active AS prev
        ON prev.customer_id = cur.customer_id
        AND prev.month_start = addMonths(cur.month_start, -1)
      LEFT JOIN first_active fa
        ON fa.customer_id = COALESCE(cur.customer_id, prev.customer_id)
    ),

    -- Aggregate waterfall buckets per month.
    waterfall AS (
      SELECT
        month_start,
        round(SUM(cur_base + cur_usage) / 100.0, 2) AS total_sales,
        round(SUM(cur_one_time) / 100.0, 2) AS non_recurring,
        round(SUM(CASE
          WHEN cur_base > 0 AND prev_total = 0 AND first_month = month_start
          THEN cur_base + cur_usage ELSE 0
        END) / 100.0, 2) AS new_sales,
        round(SUM(CASE
          WHEN cur_base > 0 AND prev_total > 0
          THEN cur_base + cur_usage ELSE 0
        END) / 100.0, 2) AS retained,
        round(SUM(CASE
          WHEN cur_base > 0 AND prev_total = 0 AND first_month < month_start
          THEN cur_base + cur_usage ELSE 0
        END) / 100.0, 2) AS resurrected,
        round(SUM(CASE
          WHEN cur_base > 0 AND prev_total > 0 AND (cur_base + cur_usage) > prev_total
          THEN (cur_base + cur_usage) - prev_total ELSE 0
        END) / 100.0, 2) AS expansion,
        round(SUM(CASE
          WHEN cur_base > 0 AND prev_total > 0 AND (cur_base + cur_usage) < prev_total
          THEN (cur_base + cur_usage) - prev_total ELSE 0
        END) / 100.0, 2) AS contraction,
        round(SUM(CASE
          WHEN cur_base = 0 AND prev_total > 0
          THEN -prev_total ELSE 0
        END) / 100.0, 2) AS churned
      FROM movement
      GROUP BY month_start
    ),

    -- Month spine: every month from startDate through endDate (inclusive), so the result
    -- always has a row per month even when there is no billing activity.
    months AS (
      SELECT addMonths(toStartOfMonth({startDate:DateTime64}), number) AS month_start
      FROM numbers(
        dateDiff('month', toStartOfMonth({startDate:DateTime64}), toStartOfMonth({endDate:DateTime64})) + 1
      )
    )

    SELECT
      formatDateTime(m.month_start, '%Y-%m') AS month,
      COALESCE(w.total_sales,   0) AS totalSales,
      COALESCE(w.non_recurring, 0) AS nonRecurring,
      COALESCE(w.new_sales,     0) AS newSales,
      COALESCE(w.retained,      0) AS retained,
      COALESCE(w.resurrected,   0) AS resurrected,
      COALESCE(w.expansion,     0) AS expansion,
      COALESCE(w.contraction,   0) AS contraction,
      COALESCE(w.churned,       0) AS churned
    FROM months m
    LEFT JOIN waterfall w ON w.month_start = m.month_start
    ORDER BY m.month_start
    SETTINGS join_use_nulls = 1
    `,
    { paymentProviderId, startDate, endDate },
    FUNCTION_NAME,
  );

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
