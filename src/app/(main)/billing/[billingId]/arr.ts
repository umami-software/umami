import type { ARRMetrics } from '@/queries/sql/billing/getARR';

export interface ARRSeriesDef {
  key: keyof Pick<
    ARRMetrics,
    'retained' | 'newSales' | 'resurrected' | 'expansion' | 'contraction' | 'churned'
  >;
  label: string;
  color: string;
}

export const ARR_SERIES: ARRSeriesDef[] = [
  { key: 'retained', label: 'Retained ARR', color: '#2680eb' },
  { key: 'newSales', label: 'New Sales ARR', color: '#f7bd12' },
  { key: 'resurrected', label: 'Resurrected ARR', color: '#9256d9' },
  { key: 'expansion', label: 'Expansion ARR', color: '#44b556' },
  { key: 'contraction', label: 'Contraction ARR', color: '#e68619' },
  { key: 'churned', label: 'Churned ARR', color: '#e34850' },
];

export const YOY_GROWTH_COLOR = '#89c541';

// useBillingMetricsQuery fetches 12 extra trailing months beyond this so every displayed
// month has a same-month comparator for YoY growth; components slice their computed output
// down to this count before rendering.
export const DISPLAY_MONTHS = 24;

// ARRMetrics.month is a 'YYYY-MM' key. `new Date('YYYY-MM-01')` parses as UTC midnight, which
// renders as the prior month in any timezone behind UTC — appending a local time avoids that.
export function parseMonthKey(month: string): Date {
  return new Date(`${month}-01T00:00:00`);
}

export interface ARRRollForwardRow extends ARRMetrics {
  startingARR: number;
  endingARR: number;
}

// Ending ARR for a month is the active recurring book (newSales + retained + resurrected),
// which is exactly what getARR returns as totalSales. Starting ARR is last month's ending
// ARR; for the first month in the fetched range (no prior row), back-derive it from the
// waterfall identity so the roll-forward still ties out.
export function computeRollForward(data: ARRMetrics[]): ARRRollForwardRow[] {
  return data.map((row, i) => {
    const endingARR = row.totalSales;
    const movement = row.newSales + row.expansion + row.resurrected + row.contraction + row.churned;
    const startingARR = i > 0 ? data[i - 1].totalSales : endingARR - movement;

    return { ...row, startingARR, endingARR };
  });
}

// Year-over-year growth needs a same-month comparator 12 rows back in the fetched series.
// Months without that comparator (the first 12 rows of the fetched range) return null.
export function computeYoYGrowth(data: ARRMetrics[]): (number | null)[] {
  return data.map((row, i) => {
    const prior = data[i - 12];
    if (!prior?.totalSales) return null;
    return ((row.totalSales - prior.totalSales) / prior.totalSales) * 100;
  });
}
