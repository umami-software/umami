import { formatDate } from 'lib/date';
import { Flexbox, StatusLight } from 'react-basics';
import { formatLongNumber } from 'lib/format';
import { useLocale } from 'components/hooks';

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

export default function BarChartTooltip({ tooltip, unit }) {
  const { locale } = useLocale();
  const { labelColors, dataPoints } = tooltip;

  return (
    <Flexbox direction="column" gap={10}>
      <div>{formatDate(new Date(dataPoints[0].raw.x), formats[unit], locale)}</div>
      <div>
        <StatusLight color={labelColors?.[0]?.backgroundColor}>
          {formatLongNumber(dataPoints[0].raw.y)} {dataPoints[0].dataset.label}
        </StatusLight>
      </div>
    </Flexbox>
  );
}
