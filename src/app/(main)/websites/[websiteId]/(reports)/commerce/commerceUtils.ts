import { formatLongCurrency, formatShortTime } from '@/lib/format';

export const COMMERCE_TABS = ['overview', 'customers', 'attribution'] as const;

export type CommerceTab = (typeof COMMERCE_TABS)[number];

/** URL parameters owned by the commerce report, reset when leaving it. */
export const COMMERCE_URL_PARAMS = ['tab', 'market', 'order', 'model'];

export function isCommerceTab(value: unknown): value is CommerceTab {
  return COMMERCE_TABS.includes(value as CommerceTab);
}

export function formatPercent(value: number) {
  const percent = (Number(value) || 0) * 100;

  return `${percent > 0 && percent < 10 ? percent.toFixed(1) : Math.round(percent)}%`;
}

export function formatDuration(seconds: number) {
  return formatShortTime(Math.max(0, Math.round(Number(seconds) || 0)), ['d', 'h', 'm', 's'], ' ');
}

export function currencyFormatter(currency: string) {
  return (value: number) =>
    value == null ? '—' : formatLongCurrency(Number(value) || 0, currency);
}

export function formatDecimal(value: number) {
  return (Number(value) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
