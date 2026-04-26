import 'dotenv/config';
import fs from 'node:fs';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2026-02-25.clover',
});

const invoices: Stripe.Invoice[] = JSON.parse(fs.readFileSync('src/lib/z-invoices.json', 'utf-8'));

const subscriptions: Stripe.Subscription[] = JSON.parse(
  fs.readFileSync('src/lib/y-subscriptions.json', 'utf-8'),
);

export interface MonthlyARR {
  month: string;
  totalSales?: number; // recurring only: base MRR + usage
  nonRecurring?: number; // one-time charges (setup fees, etc.) — not part of MRR waterfall
  newSales?: number;
  retained?: number;
  resurrected?: number;
  expansion?: number;
  contraction?: number;
  churned?: number;
}

function toMonthKey(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

type CustomerMonthMRR = { base: number; usage: number; oneTime: number };

// Builds Map<customerId, Map<monthKey, {base, usage}>> from paid invoices.
//
// Base lines (period.start >= invoice.period_end) are spread across every month
// in their service window so annual plans contribute consistent monthly MRR.
// Usage lines (period.start < invoice.period_end) are allocated to the invoice month.
function buildCustomerMRRByMonth(): Map<string, Map<string, CustomerMonthMRR>> {
  const map = new Map<string, Map<string, CustomerMonthMRR>>();

  function add(customerId: string, monthKey: string, base: number, usage: number, oneTime = 0) {
    if (!map.has(customerId)) map.set(customerId, new Map());
    const byMonth = map.get(customerId) as Map<string, CustomerMonthMRR>;
    const prev = byMonth.get(monthKey) ?? { base: 0, usage: 0, oneTime: 0 };
    byMonth.set(monthKey, {
      base: prev.base + base,
      usage: prev.usage + usage,
      oneTime: prev.oneTime + oneTime,
    });
  }

  for (const invoice of invoices) {
    if (invoice.status !== 'paid') continue;
    const customerId = invoice.customer as string;

    for (const line of (invoice.lines as any).data) {
      const usageType = line.pricing?.price_details?.price?.recurring?.usage_type;
      if (usageType === 'licensed') {
        // Base line — spread MRR across all months in the service period
        const periodMonths = Math.max(
          1,
          Math.round((line.period.end - line.period.start) / (86400 * 30.44)),
        );
        const mrrPerMonth = line.amount / 100 / periodMonths;
        const start = new Date(line.period.start * 1000);
        const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        for (let m = 0; m < periodMonths; m++) {
          add(customerId, toMonthKey(cur.getTime() / 1000), mrrPerMonth, 0);
          cur.setUTCMonth(cur.getUTCMonth() + 1);
        }
      } else if (usageType === 'metered') {
        // Usage line — allocate to the invoice's period_end month
        add(customerId, toMonthKey(invoice.period_end), 0, line.amount / 100);
      } else if (!usageType) {
        // No recurring price (one-time charge) — tracked separately, not part of MRR
        add(customerId, toMonthKey(invoice.period_end), 0, 0, line.amount / 100);
      }
    }
  }

  return map;
}

export function getARRMetrics(startDate: Date, endDate: Date): MonthlyARR[] {
  // Set to a customer ID to scope analysis to a single customer. Remove to see all.
  const debugCustomerId = '';

  const months: string[] = [];
  const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  while (cursor < endDate) {
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  const allCustomerMRR = buildCustomerMRRByMonth();
  const customerMRR = debugCustomerId
    ? new Map([
        [
          debugCustomerId,
          allCustomerMRR.get(debugCustomerId) ?? new Map<string, CustomerMonthMRR>(),
        ],
      ])
    : allCustomerMRR;

  // Precompute each customer's first active month for new vs resurrected classification
  const firstActiveMonth = new Map<string, string>();
  for (const [customerId, byMonth] of customerMRR) {
    const first = [...byMonth.entries()]
      .filter(([, mrr]) => mrr.base > 0)
      .map(([mk]) => mk)
      .sort()[0];
    if (first) firstActiveMonth.set(customerId, first);
  }

  // The current month is incomplete — not all customers have been invoiced yet.
  const currentMonthKey = toMonthKey(endDate.getTime() / 1000);

  // Build a lookup of active subscription customers for the current-month fallback.
  // "Active" means they have a live subscription regardless of whether invoiced yet.
  const activeSubCustomers = new Set(
    subscriptions
      .filter(s => ['active', 'trialing', 'past_due'].includes(s.status))
      .map(s => s.customer as string),
  );

  function getActiveCustomers(monthKey: string): Map<string, CustomerMonthMRR> {
    const result = new Map<string, CustomerMonthMRR>();
    for (const [customerId, byMonth] of customerMRR) {
      const mrr = byMonth.get(monthKey);
      if (mrr && mrr.base > 0) result.set(customerId, mrr);
    }

    // For the current incomplete month, also include subscription-active customers
    // who haven't been invoiced yet by carrying forward their last known base MRR.
    if (monthKey === currentMonthKey) {
      for (const customerId of activeSubCustomers) {
        if (result.has(customerId)) continue;
        const byMonth = customerMRR.get(customerId);
        if (!byMonth) continue;
        const lastBase =
          [...byMonth.entries()]
            .filter(([mk, mrr]) => mk < monthKey && mrr.base > 0)
            .sort(([a], [b]) => b.localeCompare(a))[0]?.[1]?.base ?? 0;
        if (lastBase > 0) result.set(customerId, { base: lastBase, usage: 0, oneTime: 0 });
      }
    }

    return result;
  }

  const results: MonthlyARR[] = [];

  for (let i = 0; i < months.length; i++) {
    const monthKey = months[i];
    const prevMonthKey = i > 0 ? months[i - 1] : null;

    const current = getActiveCustomers(monthKey);
    const prev = prevMonthKey
      ? getActiveCustomers(prevMonthKey)
      : new Map<string, CustomerMonthMRR>();

    let totalSales = 0;
    let nonRecurring = 0;
    let newSales = 0;
    let retained = 0;
    let resurrected = 0;
    let expansion = 0;
    let contraction = 0;
    let churned = 0;

    for (const [
      customerId,
      { base: currentBase, usage: currentUsage, oneTime: currentOneTime },
    ] of current) {
      totalSales += currentBase + currentUsage;
      nonRecurring += currentOneTime;

      const currentTotal = currentBase + currentUsage;

      if (!prev.has(customerId)) {
        // Not present last month — new or resurrected
        if (firstActiveMonth.get(customerId) === monthKey) {
          newSales += currentTotal;
        } else {
          resurrected += currentTotal;
        }
      } else {
        const { base: prevBase, usage: prevUsage } = prev.get(customerId) as CustomerMonthMRR;
        const prevTotal = prevBase + prevUsage;
        retained += currentTotal;

        const delta = currentTotal - prevTotal;
        if (delta > 0) expansion += delta;
        else if (delta < 0) contraction += delta;
      }
    }

    for (const [customerId, { base: prevBase, usage: prevUsage }] of prev) {
      if (!current.has(customerId)) {
        churned -= prevBase + prevUsage;
      }
    }

    results.push({
      month: monthKey,
      totalSales: round2(totalSales),
      nonRecurring: round2(nonRecurring),
      newSales: round2(newSales),
      retained: round2(retained),
      resurrected: round2(resurrected),
      expansion: round2(expansion),
      contraction: round2(contraction),
      churned: round2(churned),
    });
  }

  return results;
}

// ─── Per-owner sync helpers (accept a caller-supplied Stripe instance) ──────

const INVOICE_EXPAND = ['data.lines.data.pricing.price_details.price'];

function startOfCurrentMonth(): number {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

// Fetch one page of invoices oldest-first for backfill. Pass null cursor to start from the beginning.
export async function fetchInvoicePageBackfill(
  client: Stripe,
  cursor: string | null,
): Promise<Awaited<ReturnType<typeof client.invoices.list>>> {
  return client.invoices.list({
    limit: 100,
    expand: INVOICE_EXPAND,
    created: { lte: Math.floor(Date.now() / 1000) },
    ...(cursor ? { starting_after: cursor } : {}),
  });
}

// Fetch one page of invoices created in the current calendar month (incremental refresh).
export async function fetchInvoicePageIncremental(
  client: Stripe,
): Promise<Awaited<ReturnType<typeof client.invoices.list>>> {
  return client.invoices.list({
    limit: 100,
    expand: INVOICE_EXPAND,
    created: { gte: startOfCurrentMonth() },
  });
}

// ─── Global helpers (use module-level stripe client) ────────────────────────

export async function fetchAllSubscriptions(): Promise<Stripe.Subscription[]> {
  const subscriptions: Stripe.Subscription[] = [];
  let page = await stripe.subscriptions.list({
    limit: 100,
    status: 'all',
    expand: ['data.items.data.price'],
  });
  subscriptions.push(...page.data);
  while (page.has_more) {
    page = await stripe.subscriptions.list({
      limit: 100,
      status: 'all',
      expand: ['data.items.data.price'],
      starting_after: page.data[page.data.length - 1].id,
    });
    subscriptions.push(...page.data);
  }
  fs.writeFileSync('src/lib/y-subscriptions.json', JSON.stringify(subscriptions, null, 2));
  console.log(`Wrote ${subscriptions.length} subscriptions to src/lib/y-subscriptions.json`);
  return subscriptions;
}

export async function fetchAllInvoices(): Promise<Stripe.Invoice[]> {
  const invoices: Stripe.Invoice[] = [];
  let page = await stripe.invoices.list({
    limit: 100,
    expand: ['data.lines.data.pricing.price_details.price'],
  });
  invoices.push(...page.data);
  while (page.has_more) {
    page = await stripe.invoices.list({
      limit: 100,
      expand: ['data.lines.data.pricing.price_details.price'],
      starting_after: page.data[page.data.length - 1].id,
    });
    invoices.push(...page.data);
  }
  fs.writeFileSync('src/lib/z-invoices.json', JSON.stringify(invoices, null, 2));
  console.log(`Wrote ${invoices.length} invoices to src/lib/z-invoices.json`);
  return invoices;
}

console.log('start: ', new Date());

// console.log(getARRMetrics(new Date('2025-11-01'), new Date()));

// fetchAllSubscriptions().then(() => {
//   console.log('done: ', new Date());
// });

// fetchAllInvoices().then(() => {
//   console.log('done: ', new Date());
// });

export default {
  client: stripe,
};
