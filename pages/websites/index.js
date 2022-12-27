import Settings from 'components/pages/Settings';
import useConfig from 'hooks/useConfig';
import useRequireLogin from 'hooks/useRequireLogin';
import React from 'react';
import WebsitesList from 'components/pages/WebsitesList';

export default function WebsitesPage() {
  const { loading } = useRequireLogin();
  const { adminDisabled } = useConfig();

  if (adminDisabled || loading) {
    return null;
  }

  return (
    <Settings>
      <WebsitesList />
    </Settings>
  );
}
