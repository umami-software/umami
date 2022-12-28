import { useRouter } from 'next/router';
import WebsiteSettings from 'components/pages/WebsiteSettings';
import useUser from 'hooks/useUser';
import Settings from 'components/pages/Settings';

export default function WebsiteSettingsPage() {
  const user = useUser();
  const router = useRouter();
  const { id } = router.query;

  if (!id || !user) {
    return null;
  }

  return (
    <Settings>
      <WebsiteSettings websiteId={id} />
    </Settings>
  );
}
