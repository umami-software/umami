import { Tooltip, TooltipTrigger, Text, Focusable } from '@umami/react-zen';
import { formatDistanceToNow } from 'date-fns';
import { useLocale, useTimezone } from '@/components/hooks';

export function DateDistance({ date }: { date: Date }) {
  const { formatTimezoneDate } = useTimezone();
  const { dateLocale } = useLocale();

  return (
    <TooltipTrigger delay={0}>
      <Focusable>
        <Text>{formatDistanceToNow(date, { addSuffix: true, locale: dateLocale })}</Text>
      </Focusable>
      <Tooltip>{formatTimezoneDate(date.toISOString(), 'PPPpp')}</Tooltip>
    </TooltipTrigger>
  );
}
