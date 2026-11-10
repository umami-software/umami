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
