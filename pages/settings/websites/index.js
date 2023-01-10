import SettingsLayout from 'components/pages/settings/SettingsLayout';
import useConfig from 'hooks/useConfig';
import useRequireLogin from 'hooks/useRequireLogin';
import WebsitesList from 'components/pages/settings/websites/WebsitesList';

export default function WebsitesPage() {
  const { user } = useRequireLogin();
  const { adminDisabled } = useConfig();

  if (adminDisabled || !user) {
    return null;
  }

  return (
    <SettingsLayout>
      <WebsitesList />
    </SettingsLayout>
  );
}
