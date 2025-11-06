import { Text } from '@umami/react-zen';
import { formatDistanceToNow } from 'date-fns';
import { useLocale, useTimezone } from '@/components/hooks';

export function DateDistance({ date }: { date: Date }) {
  const { formatTimezoneDate } = useTimezone();
  const { dateLocale } = useLocale();

  return (
    <Text title={formatTimezoneDate(date.toISOString(), 'PPPpp')}>
      {formatDistanceToNow(date, { addSuffix: true, locale: dateLocale })}
    </Text>
  );
}
