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
  totalSales?: number;
  newSales?: number;
  retained?: number;
  resurrected?: number;
  expansion?: number;
  contraction?: number;
  churned?: number;
}

// Annualizes the licensed (fixed) items on a subscription. Metered items have
// unit_amount=null and are skipped automatically by the !unit check.
function annualize(sub: Stripe.Subscription): number {
  let amount = 0;
  for (const item of sub.items.data) {
    const unit = item.price.unit_amount;
    const rec = item.price.recurring;
    if (!unit || !rec) continue;
    const qty = item.quantity || 1;
    let mult = 1;
    switch (rec.interval) {
      case 'month':
        mult = 12 / (rec.interval_count || 1);
        break;
      case 'year':
        mult = 1 / (rec.interval_count || 1);
        break;
      case 'week':
        mult = 52 / (rec.interval_count || 1);
        break;
      case 'day':
        mult = 365 / (rec.interval_count || 1);
        break;
    }
    amount += unit * qty * mult;
  }
  return amount / 100;
}

function monthlyMRR(sub: Stripe.Subscription): number {
  return annualize(sub) / 12;
}

function toMonthKey(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function startOfMonthTs(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number);
  return Math.floor(new Date(Date.UTC(year, month - 1, 1)).getTime() / 1000);
}

function endOfMonthTs(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number);
  return Math.floor(new Date(Date.UTC(year, month, 1)).getTime() / 1000) - 1;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Builds a map of { monthKey → { customerId → totalUsageAmountInDollars } }
// "Usage" lines are those whose period covers the past billing window
// (line.period.start < invoice.period_end), i.e. the metered charge.
function buildUsageByMonth(): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  for (const invoice of invoices) {
    if (invoice.status !== 'paid') continue;
    const monthKey = toMonthKey(invoice.period_end);
    if (!map.has(monthKey)) map.set(monthKey, new Map());
    const byCustomer = map.get(monthKey) as Map<string, number>;
    const customerId = invoice.customer as string;
    let usageCents = 0;
    for (const line of (invoice.lines as any).data as Stripe.InvoiceLineItem[]) {
      if (line.period.start < invoice.period_end) {
        usageCents += line.amount;
      }
    }
    byCustomer.set(customerId, (byCustomer.get(customerId) ?? 0) + usageCents);
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

  const usageByMonth = buildUsageByMonth();

  function getActiveSubs(eom: number): Stripe.Subscription[] {
    return subscriptions.filter(
      sub => sub.start_date <= eom && (sub.canceled_at == null || sub.canceled_at > eom),
    );
  }

  const results: MonthlyARR[] = [];

  for (let i = 0; i < months.length; i++) {
    const monthKey = months[i];
    const eom = endOfMonthTs(monthKey);
    const prevEom = i > 0 ? endOfMonthTs(months[i - 1]) : startOfMonthTs(monthKey) - 1;
    const som = startOfMonthTs(monthKey);

    const currentSubs = getActiveSubs(eom);
    const prevSubs = getActiveSubs(prevEom);

    const prevSubIds = new Set(prevSubs.map(s => s.id));
    const currentSubIds = new Set(currentSubs.map(s => s.id));
    const prevMRRById = new Map(prevSubs.map(s => [s.id, monthlyMRR(s)]));

    // Customers who had any subscription start before this month (for resurrected detection)
    const priorCustomers = new Set(
      subscriptions.filter(s => s.start_date < som).map(s => s.customer as string),
    );
    const prevCustomers = new Set(prevSubs.map(s => s.customer as string));

    let totalSales = 0;
    let newSales = 0;
    let retained = 0;
    let resurrected = 0;
    let expansion = 0;
    let contraction = 0;

    for (const sub of currentSubs) {
      const mrr = monthlyMRR(sub);
      totalSales += mrr;

      if (!prevSubIds.has(sub.id)) {
        // New to this month — classify as new or resurrected
        if (priorCustomers.has(sub.customer as string)) {
          resurrected += mrr;
        } else {
          newSales += mrr;
        }
      } else {
        // Existed last month — split into retained + expansion/contraction
        const prevMRR = prevMRRById.get(sub.id) ?? 0;
        retained += Math.min(mrr, prevMRR);
        const baseDelta = mrr - prevMRR;
        if (baseDelta > 0) expansion += baseDelta;
        else if (baseDelta < 0) contraction += baseDelta;
      }
    }

    // Churned: subs active last month that are gone this month
    let churned = 0;
    for (const sub of prevSubs) {
      if (!currentSubIds.has(sub.id)) {
        churned -= monthlyMRR(sub);
      }
    }

    // Expansion/contraction from metered usage — only for customers active in both months
    const currentUsage = usageByMonth.get(monthKey) ?? new Map<string, number>();
    const prevUsage =
      i > 0
        ? (usageByMonth.get(months[i - 1]) ?? new Map<string, number>())
        : new Map<string, number>();

    for (const customerId of new Set(currentSubs.map(s => s.customer as string))) {
      if (!prevCustomers.has(customerId)) continue;
      const deltaCents = (currentUsage.get(customerId) ?? 0) - (prevUsage.get(customerId) ?? 0);
      if (deltaCents > 0) expansion += deltaCents / 100;
      else if (deltaCents < 0) contraction += deltaCents / 100;
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
  let page = await stripe.subscriptions.list({ limit: 100, expand: ['data.items.data.price'] });
  subscriptions.push(...page.data);
  while (page.has_more) {
    page = await stripe.subscriptions.list({
      limit: 100,
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
  let page = await stripe.invoices.list({ limit: 100 });
  invoices.push(...page.data);
  while (page.has_more) {
    page = await stripe.invoices.list({
      limit: 100,
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
