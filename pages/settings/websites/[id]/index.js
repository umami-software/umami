import { useRouter } from 'next/router';
import WebsiteSettings from 'components/pages/settings/websites/WebsiteSettings';
import AppLayout from 'components/layout/AppLayout';

export default function WebsiteSettingsPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return null;
  }

  return (
    <AppLayout>
      <WebsiteSettings websiteId={id} />
    </AppLayout>
  );
}
