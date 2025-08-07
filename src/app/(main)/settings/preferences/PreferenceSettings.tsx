import { Column, Label } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { TimezoneSetting } from './TimezoneSetting';
import { DateRangeSetting } from './DateRangeSetting';
import { LanguageSetting } from './LanguageSetting';
import { ThemeSetting } from './ThemeSetting';

export function PreferenceSettings() {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  if (!user) {
    return null;
  }

  return (
    <Column width="400px" gap="6">
      <Column>
        <Label>{formatMessage(labels.defaultDateRange)}</Label>
        <DateRangeSetting />
      </Column>
      <Column>
        <Label>{formatMessage(labels.timezone)}</Label>
        <TimezoneSetting />
      </Column>
      <Column>
        <Label>{formatMessage(labels.language)}</Label>
        <LanguageSetting />
      </Column>
      <Column>
        <Label>{formatMessage(labels.theme)}</Label>
        <ThemeSetting />
      </Column>
    </Column>
  );
}
