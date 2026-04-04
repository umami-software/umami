import { Column, Label, Row } from '@umami/react-zen';
import { useConfig, useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { PasswordChangeButton } from './PasswordChangeButton';

export function ProfileSettings() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();
  const { cloudMode } = useConfig();

  if (!user) {
    return null;
  }

  const { username, role } = user;

  const renderRole = (value: string) => {
    if (value === ROLES.user) {
      return t(labels.user);
    }
    if (value === ROLES.admin) {
      return t(labels.admin);
    }
    if (value === ROLES.viewOnly) {
      return t(labels.viewOnly);
    }

    return t(labels.unknown);
  };

  return (
    <Column gap="6">
      <Column>
        <Label>{t(labels.username)}</Label>
        {username}
      </Column>
      <Column>
        <Label>{t(labels.role)}</Label>
        {renderRole(role)}
      </Column>
      {!cloudMode && (
        <Column>
          <Label>{t(labels.password)}</Label>
          <Row>
            <PasswordChangeButton />
          </Row>
        </Column>
      )}
    </Column>
  );
}
