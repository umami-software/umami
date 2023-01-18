import AppLayout from 'components/layout/AppLayout';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';

import UsersList from 'components/pages/settings/users/UsersList';

export default function UsersPage() {
  const user = useUser();
  const { adminDisabled } = useConfig();

  if (adminDisabled || !user) {
    return null;
  }

  return (
    <AppLayout>
      <UsersList />
    </AppLayout>
  );
}
