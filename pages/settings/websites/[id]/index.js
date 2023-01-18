import { useRouter } from 'next/router';
import WebsiteDetails from 'components/pages/settings/websites/WebsiteDetails';
import useUser from 'hooks/useUser';
import AppLayout from 'components/layout/AppLayout';

export default function WebsiteSettingsPage() {
  const user = useUser();
  const router = useRouter();
  const { id } = router.query;

  if (!id || !user) {
    return null;
  }

  return (
    <AppLayout>
      <WebsiteDetails websiteId={id} />
    </AppLayout>
  );
}
