import SettingsLayout from 'components/pages/settings/SettingsLayout';
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
    <SettingsLayout>
      <UsersList />
    </SettingsLayout>
  );
}
