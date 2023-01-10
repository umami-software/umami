import { useRouter } from 'next/router';
import WebsiteDetails from 'components/pages/settings/websites/WebsiteDetails';
import useUser from 'hooks/useUser';
import SettingsLayout from 'components/pages/settings/SettingsLayout';

export default function WebsiteSettingsPage() {
  const user = useUser();
  const router = useRouter();
  const { id } = router.query;

  if (!id || !user) {
    return null;
  }

  return (
    <SettingsLayout>
      <WebsiteDetails websiteId={id} />
    </SettingsLayout>
  );
}
