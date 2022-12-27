import Settings from 'components/pages/Settings';
import TeamsList from 'components/pages/TeamsList';
import useRequireLogin from 'hooks/useRequireLogin';
import React from 'react';

export default function TeamsPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Settings>
      <TeamsList />
    </Settings>
  );
}
