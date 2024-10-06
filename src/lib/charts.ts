import { type IntlShape } from 'react-intl';

export function renderDateLabels(intl: IntlShape, unit: string) {
  return (label: string, index: number, values: any[]) => {
    const d = new Date(values[index].value);

    switch (unit) {
      case 'minute':
        return intl.formatDate(d, { timeStyle: 'short' });
      case 'hour':
        return intl.formatDate(d, { timeStyle: 'short' });
      case 'day':
        return intl.formatDate(d, { month: 'short', day: 'numeric' });
      case 'month':
        return intl.formatDate(d, { month: 'short' });
      case 'year':
        return intl.formatDate(d, { year: 'numeric' });
      default:
        return label;
    }
  };
}
