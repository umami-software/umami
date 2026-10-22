import { parseISO } from 'date-fns';
import { formatDate } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';

export function renderNumberLabels(label: string) {
  return +label > 1000 ? formatLongNumber(+label) : label;
}

export function renderDateLabels(unit: string, locale: string) {
  return (label: string, index: number, values: any[]) => {
    const d = new Date(values[index].value);

    switch (unit) {
      case 'minute':
      case 'hour':
        return formatDate(d, 'p', locale);
      case 'day':
        return formatDate(d, 'PP', locale).replace(/\W*20\d{2}\W*/, ''); // Remove year
      case 'month':
        return formatDate(d, 'MMM', locale);
      case 'year':
        return formatDate(d, 'yyyy', locale);
      default:
        return label;
    }
  };
}

// Reads a bucket like the time scale does: '2026-09-05' is local midnight, new Date() makes it UTC
export function getChartBucketTime(bucket: any) {
  const x = bucket?.x ?? bucket;

  return (typeof x === 'string' ? parseISO(x) : new Date(x)).getTime();
}

// Returns the last bucket starting at or before date, or -1. Buckets must be in ascending order.
export function getChartBucketIndex(data: any[], date: Date) {
  let index = -1;

  for (let i = 0; i < data.length; i++) {
    const timestamp = getChartBucketTime(data[i]);

    if (!Number.isFinite(timestamp)) continue;
    if (timestamp > date.getTime()) break;

    index = i;
  }

  return index;
}
