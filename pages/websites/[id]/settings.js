import React from 'react';
import { useRouter } from 'next/router';
import WebsiteSettings from 'components/pages/WebsiteSettings';
import useRequireLogin from 'hooks/useRequireLogin';
import Settings from 'components/pages/Settings';

export default function WebsiteSettingsPage() {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;

  if (!id || loading) {
    return null;
  }

  return (
    <Settings>
      <WebsiteSettings websiteId={id} />
    </Settings>
  );
}
