import { Column, Label } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { DateRangeSetting } from './DateRangeSetting';
import { LanguageSetting } from './LanguageSetting';
import { ThemeSetting } from './ThemeSetting';
import { TimezoneSetting } from './TimezoneSetting';
import { VersionSetting } from './VersionSetting';

export function PreferenceSettings() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();

  if (!user) {
    return null;
  }

  return (
    <Column gap="6">
      <Column>
        <Label>{t(labels.defaultDateRange)}</Label>
        <DateRangeSetting />
      </Column>
      <Column>
        <Label>{t(labels.timezone)}</Label>
        <TimezoneSetting />
      </Column>
      <Column>
        <Label>{t(labels.language)}</Label>
        <LanguageSetting />
      </Column>
      <Column>
        <Label>{t(labels.theme)}</Label>
        <ThemeSetting />
      </Column>
      <Column>
        <Label>{t(labels.version)}</Label>
        <VersionSetting />
      </Column>
    </Column>
  );
}
