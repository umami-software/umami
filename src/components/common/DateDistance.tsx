import { Text } from '@umami/react-zen';
import { formatDistanceToNow } from 'date-fns';
import { useLocale, useTimezone } from '@/components/hooks';

export function DateDistance({ date }: { date: Date }) {
  const { formatTimezoneDate } = useTimezone();
  const { dateLocale } = useLocale();

  if (!date || isNaN(date.getTime())) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[DateDistance] Invalid date received', { date });
    }
    return <Text>—</Text>;
  }

  return (
    <Text title={formatTimezoneDate(date.toISOString(), 'PPPpp')}>
      {formatDistanceToNow(date, { addSuffix: true, locale: dateLocale })}
    </Text>
  );
}
