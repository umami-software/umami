import { StatusLight } from 'react-basics';
import { dateFormat } from 'lib/date';
import { formatLongNumber } from 'lib/format';

export function renderNumberLabels(label) {
  return +label > 1000 ? formatLongNumber(label) : label;
}

export function renderDateLabels(unit, locale) {
  return (label, index, values) => {
    const d = new Date(values[index].value);

    switch (unit) {
      case 'minute':
        return dateFormat(d, 'h:mm', locale);
      case 'hour':
        return dateFormat(d, 'p', locale);
      case 'day':
        return dateFormat(d, 'MMM d', locale);
      case 'month':
        return dateFormat(d, 'MMM', locale);
      case 'year':
        return dateFormat(d, 'YYY', locale);
      default:
        return label;
    }
  };
}

export function renderStatusTooltipPopup(unit, locale) {
  return (setTooltipPopup, model) => {
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
        <div>{dateFormat(new Date(dataPoints[0].raw.x), formats[unit], locale)}</div>
        <div>
          <StatusLight color={labelColors?.[0]?.backgroundColor}>
            {formatLongNumber(dataPoints[0].raw.y)} {dataPoints[0].dataset.label}
          </StatusLight>
        </div>
      </>,
    );
  };
}
