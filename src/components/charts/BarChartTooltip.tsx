import { Flexbox, StatusLight } from 'react-basics';
import { formatLongNumberOptions } from 'lib/format';
import { useIntl } from 'react-intl';

const formats = {
  millisecond: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 3,
  },
  second: { timeStyle: 'medium' },
  minute: { timeStyle: 'short' },
  hour: { dateStyle: 'medium', timeStyle: 'short' },
  day: { dateStyle: 'full' },
  week: { dateStyle: 'full' },
  month: { year: 'numeric', month: 'long' },
  quarter: { year: 'numeric', month: 'long' },
  year: { year: 'numeric' },
};

export default function BarChartTooltip({ tooltip, unit }) {
  const intl = useIntl();
  const { labelColors, dataPoints } = tooltip;

  return (
    <Flexbox direction="column" gap={10}>
      <div>{intl.formatDate(dataPoints[0].raw.d || dataPoints[0].raw.x, formats[unit])}</div>
      <div>
        <StatusLight color={labelColors?.[0]?.backgroundColor}>
          {intl.formatNumber(dataPoints[0].raw.y, formatLongNumberOptions(dataPoints[0].raw.y))}{' '}
          {dataPoints[0].dataset.label}
        </StatusLight>
      </div>
    </Flexbox>
  );
}
