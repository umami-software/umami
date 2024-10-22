import { Form, FormRow } from 'react-basics';
import TimezoneSetting from 'components/pages/settings/profile/TimezoneSetting';
import DateRangeSetting from 'components/pages/settings/profile/DateRangeSetting';
import LanguageSetting from 'components/pages/settings/profile/LanguageSetting';
import ThemeSetting from 'components/pages/settings/profile/ThemeSetting';
import PasswordChangeButton from './PasswordChangeButton';
import useUser from 'components/hooks/useUser';
import useMessages from 'components/hooks/useMessages';
import { ROLES } from 'lib/constants';

export function ProfileDetails() {
  const { user } = useUser();
  const { formatMessage, labels } = useMessages();
  const cloudMode = Boolean(process.env.cloudMode);

  if (!user) {
    return null;
  }

  const { username, role } = user;

  const renderRole = value => {
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

export default ProfileDetails;
