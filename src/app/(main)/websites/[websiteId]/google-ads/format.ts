import type { GoogleAdsRow } from '@/components/hooks';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

/** A plain number when the currency is unknown: naming the wrong currency would misstate spend. */
export function formatMoney(value: number, currency: string | null, locale: string) {
  return currency ? formatLongCurrency(value, currency, locale) : value.toFixed(2);
}

/** Google attributes conversions fractionally, so small values keep one decimal. */
export function formatConversions(value: number) {
  return value < 999.5 ? String(Number(value.toFixed(1))) : formatLongNumber(value);
}

/** A Google enum such as PAGE_VIEW as readable text: "Page view". */
export function formatEnum(value: string) {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Clicks per impression, as a fraction. */
export function getCtr({ clicks, impressions }: { clicks: number; impressions: number }) {
  return impressions ? clicks / impressions : 0;
}

/** Conversion value earned per unit of cost, e.g. 3.20x. */
export function formatRoas(ratio: number) {
  return `${ratio.toFixed(2)}x`;
}

export function formatPercent(fraction: number) {
  return `${(fraction * 100).toFixed(1)}%`;
}

/** Shown for a ratio with nothing to divide by. */
export const NO_VALUE = '–';

export type GoogleAdsTotals = Pick<
  GoogleAdsRow,
  'cost' | 'clicks' | 'impressions' | 'conversions' | 'conversionsValue'
>;

export function sumRows(rows: GoogleAdsTotals[]): GoogleAdsTotals {
  const totals = { cost: 0, clicks: 0, impressions: 0, conversions: 0, conversionsValue: 0 };

  for (const row of rows) {
    totals.cost += row.cost;
    totals.clicks += row.clicks;
    totals.impressions += row.impressions;
    totals.conversions += row.conversions;
    totals.conversionsValue += row.conversionsValue;
  }

  return totals;
}

const divide = (numerator: number, denominator: number) =>
  denominator ? numerator / denominator : null;

type MetricFormat = 'money' | 'number' | 'conversions' | 'percent' | 'roas';

interface MetricDefinition {
  /** Key in the googleAds messages. */
  label: string;
  format: MetricFormat;
  /** Null for a ratio with nothing to divide by: a zero would read as "free" or "no return". */
  get: (totals: GoogleAdsTotals) => number | null;
  /** True when a rise is bad news, such as a higher cost per click. */
  lowerIsBetter?: boolean;
}

/**
 * Ratios are always derived from summed totals, for a whole range or one chart bucket: per-day
 * ratios cannot be added up.
 */
export const GOOGLE_ADS_METRICS = {
  cost: { label: 'cost', format: 'money', get: t => t.cost },
  clicks: { label: 'clicks', format: 'number', get: t => t.clicks },
  impressions: { label: 'impressions', format: 'number', get: t => t.impressions },
  ctr: { label: 'ctr', format: 'percent', get: t => divide(t.clicks, t.impressions) },
  cpc: {
    label: 'cpc',
    format: 'money',
    get: t => divide(t.cost, t.clicks),
    lowerIsBetter: true,
  },
  conversions: { label: 'conversions', format: 'conversions', get: t => t.conversions },
  conversionsValue: { label: 'conversionValue', format: 'money', get: t => t.conversionsValue },
  costPerConversion: {
    label: 'costPerConversion',
    format: 'money',
    get: t => divide(t.cost, t.conversions),
    lowerIsBetter: true,
  },
  conversionRate: {
    label: 'conversionRate',
    format: 'percent',
    get: t => divide(t.conversions, t.clicks),
  },
  roas: { label: 'roas', format: 'roas', get: t => divide(t.conversionsValue, t.cost) },
} as const satisfies Record<string, MetricDefinition>;

export type GoogleAdsMetric = keyof typeof GOOGLE_ADS_METRICS;

export function isLowerBetter(metric: GoogleAdsMetric) {
  return (GOOGLE_ADS_METRICS[metric] as MetricDefinition).lowerIsBetter ?? false;
}

export function formatMetric(
  metric: GoogleAdsMetric,
  value: number,
  currency: string | null,
  locale: string,
) {
  switch (GOOGLE_ADS_METRICS[metric].format) {
    case 'money':
      return formatMoney(value, currency, locale);
    case 'conversions':
      return formatConversions(value);
    case 'percent':
      return formatPercent(value);
    case 'roas':
      return formatRoas(value);
    default:
      return formatLongNumber(value);
  }
}
