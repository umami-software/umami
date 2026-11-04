import { formatLongCurrency, formatLongNumber } from '@/lib/format';

/** A plain number when the currency is unknown: naming the wrong currency would misstate spend. */
export function formatMoney(value: number, currency: string | null, locale: string) {
  return currency ? formatLongCurrency(value, currency, locale) : value.toFixed(2);
}

/** Google attributes conversions fractionally, so small values keep one decimal. */
export function formatConversions(value: number) {
  return value < 999.5 ? String(Number(value.toFixed(1))) : formatLongNumber(value);
}

/** Clicks per impression, as a fraction. */
export function getCtr({ clicks, impressions }: { clicks: number; impressions: number }) {
  return impressions ? clicks / impressions : 0;
}

export function formatPercent(fraction: number) {
  return `${(fraction * 100).toFixed(1)}%`;
}
