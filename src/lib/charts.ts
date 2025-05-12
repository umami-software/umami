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
        return formatDate(d, 'h:mm', locale);
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
