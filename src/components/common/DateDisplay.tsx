import { Icon, Row, Text } from '@umami/react-zen';
import { differenceInDays, isSameDay, isValid } from 'date-fns';
import { useLocale } from '@/components/hooks';
import { Calendar } from '@/components/icons';
import { formatDate } from '@/lib/date';

export function DateDisplay({ startDate, endDate }) {
  const { locale } = useLocale();

  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return null;
  }

  const isSingleDate = differenceInDays(endDate, startDate) === 0;

  return (
    <Row gap="3" alignItems="center" wrap="nowrap">
      <Icon>
        <Calendar />
      </Icon>
      <Text wrap="nowrap">
        {isSingleDate ? (
          formatDate(startDate, 'PP', locale)
        ) : (
          <>
            {formatDate(startDate, 'PP', locale)}
            {!isSameDay(startDate, endDate) && ` — ${formatDate(endDate, 'PP', locale)}`}
          </>
        )}
      </Text>
    </Row>
  );
}
