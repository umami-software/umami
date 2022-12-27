import Settings from 'components/pages/Settings';
import useConfig from 'hooks/useConfig';
import useRequireLogin from 'hooks/useRequireLogin';
import React from 'react';
import UsersList from 'components/pages/UsersList';

export default function UsersPage() {
  const { loading } = useRequireLogin();
  const { adminDisabled } = useConfig();

  if (adminDisabled || loading) {
    return null;
  }

  return (
    <Settings>
      <UsersList />
    </Settings>
  );
}
