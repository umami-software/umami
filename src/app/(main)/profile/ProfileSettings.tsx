import { Form, FormRow } from 'react-basics';
import TimezoneSetting from '@/app/(main)/profile/TimezoneSetting';
import DateRangeSetting from '@/app/(main)/profile/DateRangeSetting';
import LanguageSetting from '@/app/(main)/profile/LanguageSetting';
import ThemeSetting from '@/app/(main)/profile/ThemeSetting';
import PasswordChangeButton from './PasswordChangeButton';
import { useLogin, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function ProfileSettings() {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const cloudMode = !!process.env.cloudMode;

  if (!user) {
    return null;
  }

  const { username, role } = user;

  const renderRole = (value: string) => {
    if (value === ROLES.user) {
      return formatMessage(labels.user);
    }
    if (value === ROLES.admin) {
      return formatMessage(labels.admin);
    }
    if (value === ROLES.viewOnly) {
      return formatMessage(labels.viewOnly);
    }

    return formatMessage(labels.unknown);
  };

  return (
    <Form>
      <FormRow label={formatMessage(labels.username)}>{username}</FormRow>
      <FormRow label={formatMessage(labels.role)}>{renderRole(role)}</FormRow>
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

export default ProfileSettings;
