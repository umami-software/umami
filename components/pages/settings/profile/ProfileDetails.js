import { Form, FormRow } from 'react-basics';
import TimezoneSetting from 'components/pages/settings/profile/TimezoneSetting';
import DateRangeSetting from 'components/pages/settings/profile/DateRangeSetting';
import LanguageSetting from 'components/pages/settings/profile/LanguageSetting';
import ThemeSetting from 'components/pages/settings/profile/ThemeSetting';
import PasswordChangeButton from './PasswordChangeButton';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export function ProfileDetails() {
  const { user } = useUser();
  const { formatMessage, labels } = useMessages();
  const { cloudMode } = useConfig();

  if (!user) {
    return null;
  }

  const { username, role } = user;

  return (
    <Form>
      <FormRow label={formatMessage(labels.username)}>{username}</FormRow>
      <FormRow label={formatMessage(labels.role)}>
        {formatMessage(labels[role] || labels.unknown)}
      </FormRow>
      {!cloudMode && (
        <FormRow label={formatMessage(labels.password)}>
          <PasswordChangeButton />
        </FormRow>
      )}
      <FormRow label={formatMessage(labels.defaultDateRange)}>
        <DateRangeSetting />
      </FormRow>
      <FormRow label={formatMessage(labels.language)}>
        <LanguageSetting />
      </FormRow>
      <FormRow label={formatMessage(labels.timezone)}>
        <TimezoneSetting />
      </FormRow>
      <FormRow label={formatMessage(labels.theme)}>
        <ThemeSetting />
      </FormRow>
    </Form>
  );
}

export default ProfileDetails;
