import AppLayout from 'components/layout/AppLayout';
import useConfig from 'hooks/useConfig';

import UsersList from 'components/pages/settings/users/UsersList';

export default function UsersPage() {
  const { adminDisabled } = useConfig();

  if (adminDisabled) {
    return null;
  }

  return (
    <AppLayout>
      <UsersList />
    </AppLayout>
  );
}
