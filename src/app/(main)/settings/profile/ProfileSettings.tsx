import { Column, Label } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function ProfileSettings() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();

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
    </Column>
  );
}
