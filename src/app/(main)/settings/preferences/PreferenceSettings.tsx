import { ActionForm } from '@/components/common/ActionForm';
import { ActionList } from '@/components/common/ActionList';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { DateRangeSetting } from './DateRangeSetting';
import { LanguageSetting } from './LanguageSetting';
import { ThemeSetting } from './ThemeSetting';
import { TimeFormatSetting } from './TimeFormatSetting';
import { TimezoneSetting } from './TimezoneSetting';

export function PreferenceSettings() {
  const { user } = useLoginQuery();
  const { t, labels, messages } = useMessages();

  if (!user) {
    return null;
  }

  return (
    <ActionList>
      <ActionForm
        label={t(labels.defaultDateRange)}
        description={t(messages.defaultDateRangeDescription)}
      >
        <DateRangeSetting />
      </ActionForm>
      <ActionForm label={t(labels.timezone)} description={t(messages.timezoneDescription)}>
        <TimezoneSetting />
      </ActionForm>
      <ActionForm label={t(labels.timeFormat)} description={t(messages.timeFormatDescription)}>
        <TimeFormatSetting />
      </ActionForm>
      <ActionForm label={t(labels.language)} description={t(messages.languageDescription)}>
        <LanguageSetting />
      </ActionForm>
      <ActionForm label={t(labels.theme)} description={t(messages.themeDescription)}>
        <ThemeSetting />
      </ActionForm>
    </ActionList>
  );
}
