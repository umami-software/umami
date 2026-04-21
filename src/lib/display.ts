import { formatNumber, truncateMiddle } from '@/lib/format';

/**
 * Format a compact label combining a truncated identifier and a formatted count.
 * Used where labels need to fit in tight horizontal spaces (e.g. list rows,
 * chart tooltips) without losing the head/tail signal of the identifier.
 */
export function formatCompactLabel(id: string, value: number, maxIdLength = 16): string {
  return `${truncateMiddle(id, maxIdLength)} (${formatNumber(value)})`;
}
