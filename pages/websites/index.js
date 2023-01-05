import Settings from 'components/pages/Settings';
import useConfig from 'hooks/useConfig';
import useRequireLogin from 'hooks/useRequireLogin';
import WebsitesList from 'components/pages/WebsitesList';

export default function WebsitesPage() {
  const { user } = useRequireLogin();
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
