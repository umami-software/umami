import { Form, FormRow } from 'react-basics';
import { useIntl, defineMessages } from 'react-intl';
import TimezoneSetting from 'components/pages/settings/profile/TimezoneSetting';
import DateRangeSetting from 'components/pages/settings/profile/DateRangeSetting';
import LanguageSetting from 'components/pages/settings/profile/LanguageSetting';
import ThemeSetting from 'components/buttons/ThemeSetting';
import useUser from 'hooks/useUser';

const messages = defineMessages({
  username: { id: 'label.username', defaultMessage: 'Username' },
  role: { id: 'label.role', defaultMessage: 'Role' },
  timezone: { id: 'label.timezone', defaultMessage: 'Timezone' },
  dateRange: { id: 'label.default-date-range', defaultMessage: 'Default date range' },
  language: { id: 'label.language', defaultMessage: 'Language' },
  theme: { id: 'label.theme', defaultMessage: 'Theme' },
});

export default function ProfileDetails() {
  const { user } = useUser();
  const { formatMessage } = useIntl();

  if (!user) {
    return null;
  }

  const { username, role } = user;

  return (
    <Form>
      <FormRow label={formatMessage(messages.username)}>{username}</FormRow>
      <FormRow label={formatMessage(messages.role)}>{role}</FormRow>
      <FormRow label={formatMessage(messages.language)} inline>
        <LanguageSetting />
      </FormRow>
      <FormRow label={formatMessage(messages.timezone)} inline>
        <TimezoneSetting />
      </FormRow>
      <FormRow label={formatMessage(messages.dateRange)} inline>
        <DateRangeSetting />
      </FormRow>
      <FormRow label={formatMessage(messages.theme)}>
        <ThemeSetting />
      </FormRow>
    </Form>
  );
}
