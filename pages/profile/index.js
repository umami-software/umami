import Settings from 'components/pages/Settings';
import ProfileSettings from 'components/pages/ProfileSettings';
import useRequireLogin from 'hooks/useRequireLogin';
import React from 'react';

export default function TeamsPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Settings>
      <ProfileSettings />
    </Settings>
  );
}
