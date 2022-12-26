import Settings from 'components/pages/Settings';
import ProfileDetails from 'components/pages/ProfileDetails';
import useRequireLogin from 'hooks/useRequireLogin';
import React from 'react';

export default function TeamsPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Settings>
      <ProfileDetails />
    </Settings>
  );
}
