import Settings from 'components/pages/Settings';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';

import WebsitesList from 'components/pages/WebsitesList';

export default function WebsitesPage() {
  const user = useUser();
  const { adminDisabled } = useConfig();

  if (adminDisabled || !user) {
    return null;
  }

  return (
    <Settings>
      <WebsitesList />
    </Settings>
  );
}
