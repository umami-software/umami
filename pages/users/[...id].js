import Settings from 'components/pages/Settings';
import UserDetails from 'components/pages/UserDetails';
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
      <UserDetails userId={id} />
    </Settings>
  );
}
