import { useLocale } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { Flexbox, StatusLight } from 'react-basics';

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

export default function BarChartTooltip({ tooltip, unit, currency }) {
  const { locale } = useLocale();
  const { labelColors, dataPoints } = tooltip;

  return (
    <Flexbox direction="column" gap={10}>
      <div>
        {formatDate(new Date(dataPoints[0].raw.d || dataPoints[0].raw.x), formats[unit], locale)}
      </div>
      <div>
        <StatusLight color={labelColors?.[0]?.backgroundColor}>
          {currency
            ? formatLongCurrency(dataPoints[0].raw.y, currency)
            : formatLongNumber(dataPoints[0].raw.y)}{' '}
          {dataPoints[0].dataset.label}
        </StatusLight>
      </div>
    </Flexbox>
  );
}
