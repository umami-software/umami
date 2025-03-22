import { Column, Label } from '@umami/react-zen';
import { TimezoneSetting } from '@/app/(main)/profile/TimezoneSetting';
import { DateRangeSetting } from '@/app/(main)/profile/DateRangeSetting';
import { LanguageSetting } from '@/app/(main)/profile/LanguageSetting';
import { ThemeSetting } from '@/app/(main)/profile/ThemeSetting';
import { PasswordChangeButton } from './PasswordChangeButton';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function ProfileSettings() {
  const { user } = useLoginQuery();
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
    <Column gap="6">
      <Column>
        <Label>{formatMessage(labels.username)}</Label>
        {username}
      </Column>

      <Column>
        <Label>{formatMessage(labels.role)}</Label>
        {renderRole(role)}
      </Column>

      {!cloudMode && (
        <Column>
          <Label>{formatMessage(labels.password)}</Label>
          <PasswordChangeButton />
        </Column>
      )}

      <Column>
        <Label>{formatMessage(labels.defaultDateRange)}</Label>
        <DateRangeSetting />
      </Column>

      <Column>
        <Label>{formatMessage(labels.language)}</Label>
        <LanguageSetting />
      </Column>

      <Column>
        <Label>{formatMessage(labels.timezone)}</Label>
        <TimezoneSetting />
      </Column>

      <Column>
        <Label>{formatMessage(labels.theme)}</Label>
        <ThemeSetting />
      </Column>
    </Column>
  );
}
