import { getMRR } from './getMRR';

export interface ARRMetrics {
  month: string;
  totalSales: number;
  newSales: number;
  retained: number;
  resurrected: number;
  expansion: number;
  contraction: number;
  churned: number;
}

const ANNUALIZED_FIELDS = [
  'totalSales',
  'newSales',
  'retained',
  'resurrected',
  'expansion',
  'contraction',
  'churned',
] as const;

// Annualizes the monthly recurring-revenue waterfall from getMRR (×12 run-rate).
// nonRecurring (one-time charges) isn't recurring revenue, so it's dropped rather than annualized.
export async function getARR(
  billingId: string,
  startDate: Date,
  endDate: Date,
): Promise<ARRMetrics[]> {
  const monthly = await getMRR(billingId, startDate, endDate);

  return monthly.map(row => {
    const annualized = { month: row.month } as ARRMetrics;

    for (const field of ANNUALIZED_FIELDS) {
      annualized[field] = Number(((row[field] ?? 0) * 12).toFixed(2));
    }

    return annualized;
  });
}
