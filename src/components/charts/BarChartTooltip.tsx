import { useLocale } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { Column, Row, StatusLight, FloatingTooltip, TooltipBubble } from '@umami/react-zen';

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

export function BarChartTooltip({ tooltip, unit, currency }) {
  const { locale } = useLocale();
  const { labelColors, dataPoints } = tooltip;

  return (
    <FloatingTooltip>
      <TooltipBubble>
        <Column gap="3" fontSize="1">
          <Row alignItems="center">
            {formatDate(
              new Date(dataPoints[0].raw.d || dataPoints[0].raw.x),
              formats[unit],
              locale,
            )}
          </Row>
          <Row alignItems="center">
            <StatusLight color={labelColors?.[0]?.backgroundColor}>
              {currency
                ? formatLongCurrency(dataPoints[0].raw.y, currency)
                : `${formatLongNumber(dataPoints[0].raw.y)} ${dataPoints[0].dataset.label}`}
            </StatusLight>
          </Row>
        </Column>
      </TooltipBubble>
    </FloatingTooltip>
  );
}
