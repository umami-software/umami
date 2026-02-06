import { Column, Label } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { DateRangeSetting } from './DateRangeSetting';
import { LanguageSetting } from './LanguageSetting';
import { ThemeSetting } from './ThemeSetting';
import { TimezoneSetting } from './TimezoneSetting';
import { VersionSetting } from './VersionSetting';

export function PreferenceSettings() {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  if (!user) {
    return null;
  }

  return (
    <Column gap="6">
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
      <Column>
        <Label>{formatMessage(labels.version)}</Label>
        <VersionSetting />
      </Column>
    </Column>
  );
}
