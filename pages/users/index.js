import Settings from 'components/pages/Settings';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';

import UsersList from 'components/pages/UsersList';

export default function UsersPage() {
  const user = useUser();
  const { adminDisabled } = useConfig();

  if (adminDisabled || !user) {
    return null;
  }

  return (
    <Settings>
      <UsersList />
    </Settings>
  );
}
