import { StatusLight } from 'react-basics';
import { formatDate } from 'lib/date';
import { formatLongNumber } from 'lib/format';

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
        return formatDate(d, 'MMM d', locale);
      case 'month':
        return formatDate(d, 'MMM', locale);
      case 'year':
        return formatDate(d, 'YYY', locale);
      default:
        return label;
    }
  };
}

export function renderStatusTooltipPopup(unit: string, locale: string) {
  return (setTooltipPopup: (data: any) => void, model: any) => {
    const { opacity, labelColors, dataPoints } = model.tooltip;

    if (!dataPoints?.length || !opacity) {
      setTooltipPopup(null);
      return;
    }

    const formats = {
      millisecond: 'T',
      second: 'pp',
      minute: 'p',
      hour: 'h:mm aaa - PP',
      day: 'PPPP',
      week: 'PPPP',
      month: 'LLLL yyyy',
      quarter: 'qqq',
      year: 'yyyy',
    };

    setTooltipPopup(
      <>
        <div>{formatDate(new Date(dataPoints[0].raw.x), formats[unit], locale)}</div>
        <div>
          <StatusLight color={labelColors?.[0]?.backgroundColor}>
            {formatLongNumber(dataPoints[0].raw.y)} {dataPoints[0].dataset.label}
          </StatusLight>
        </div>
      </>,
    );
  };
}
