import Settings from 'components/pages/Settings';
import UserSettings from 'components/pages/UserSettings';
import useRequireLogin from 'hooks/useRequireLogin';
import { useRouter } from 'next/router';
import React from 'react';

export default function TeamDetailPage() {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;

  if (loading) {
    return null;
  }

  return (
    <Settings>
      <UserSettings userId={id} />
    </Settings>
  );
}
