import { useRouter } from 'next/router';
import WebsiteSettings from 'components/pages/settings/websites/WebsiteSettings';
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
      <WebsiteSettings websiteId={id} />
    </AppLayout>
  );
}
