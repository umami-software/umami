import 'dotenv/config';
import fs from 'node:fs';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2026-02-25.clover',
});

const invoices: Stripe.Invoice[] = JSON.parse(fs.readFileSync('src/lib/z-invoices.json', 'utf-8'));

export interface MonthlyARR {
  month: string;
  totalSales?: number;
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

type CustomerMonthMRR = { base: number; usage: number };

// Builds Map<customerId, Map<monthKey, {base, usage}>> from paid invoices.
//
// Base lines (period.start >= invoice.period_end) are spread across every month
// in their service window so annual plans contribute consistent monthly MRR.
// Usage lines (period.start < invoice.period_end) are allocated to the invoice month.
function buildCustomerMRRByMonth(): Map<string, Map<string, CustomerMonthMRR>> {
  const map = new Map<string, Map<string, CustomerMonthMRR>>();

  function add(customerId: string, monthKey: string, base: number, usage: number) {
    if (!map.has(customerId)) map.set(customerId, new Map());
    const byMonth = map.get(customerId) as Map<string, CustomerMonthMRR>;
    const prev = byMonth.get(monthKey) ?? { base: 0, usage: 0 };
    byMonth.set(monthKey, { base: prev.base + base, usage: prev.usage + usage });
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
        const periodEnd = new Date(line.period.end * 1000);
        const start = new Date(line.period.start * 1000);
        const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        while (cur < periodEnd) {
          add(customerId, toMonthKey(cur.getTime() / 1000), mrrPerMonth, 0);
          cur.setUTCMonth(cur.getUTCMonth() + 1);
        }
      } else if (usageType === 'metered') {
        // Usage line — allocate to the invoice's period_end month
        add(customerId, toMonthKey(invoice.period_end), 0, line.amount / 100);
      }
      // one_time charges and anything else are excluded from MRR
    }
  }

  return map;
}

export function getARRMetrics(startDate: Date, endDate: Date): MonthlyARR[] {
  const months: string[] = [];
  const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  while (cursor < endDate) {
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  const customerMRR = buildCustomerMRRByMonth();

  // Precompute each customer's first active month for new vs resurrected classification
  const firstActiveMonth = new Map<string, string>();
  for (const [customerId, byMonth] of customerMRR) {
    const first = [...byMonth.entries()]
      .filter(([, mrr]) => mrr.base > 0)
      .map(([mk]) => mk)
      .sort()[0];
    if (first) firstActiveMonth.set(customerId, first);
  }

  function getActiveCustomers(monthKey: string): Map<string, CustomerMonthMRR> {
    const result = new Map<string, CustomerMonthMRR>();
    for (const [customerId, byMonth] of customerMRR) {
      const mrr = byMonth.get(monthKey);
      if (mrr && mrr.base > 0) result.set(customerId, mrr);
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
    let newSales = 0;
    let retained = 0;
    let resurrected = 0;
    let expansion = 0;
    let contraction = 0;
    let churned = 0;

    for (const [customerId, { base: currentBase, usage: currentUsage }] of current) {
      totalSales += currentBase;

      if (!prev.has(customerId)) {
        // Not present last month — new or resurrected
        if (firstActiveMonth.get(customerId) === monthKey) {
          newSales += currentBase;
        } else {
          resurrected += currentBase;
        }
      } else {
        const { base: prevBase, usage: prevUsage } = prev.get(customerId) as CustomerMonthMRR;
        retained += Math.min(currentBase, prevBase);

        const baseDelta = currentBase - prevBase;
        if (baseDelta > 0) expansion += baseDelta;
        else if (baseDelta < 0) contraction += baseDelta;

        const usageDelta = currentUsage - prevUsage;
        if (usageDelta > 0) expansion += usageDelta;
        else if (usageDelta < 0) contraction += usageDelta;
      }
    }

    for (const [customerId, { base: prevBase }] of prev) {
      if (!current.has(customerId)) {
        churned -= prevBase;
      }
    }

    results.push({
      month: monthKey,
      totalSales: round2(totalSales),
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

console.log(getARRMetrics(new Date('2025-11-01'), new Date()));

// fetchAllSubscriptions().then(() => {
//   console.log('done: ', new Date());
// });

// fetchAllInvoices().then(() => {
//   console.log('done: ', new Date());
// });

export default {
  client: stripe,
};
