import AppLayout from 'components/layout/AppLayout';
import { useRouter } from 'next/router';
import WebsiteSettings from 'components/pages/settings/websites/WebsiteSettings';
import SettingsLayout from 'components/layout/SettingsLayout';

export default function WebsiteSettingsPage({ disabled }) {
  const router = useRouter();
  const { id } = router.query;

  if (!id || disabled) {
    return null;
  }

  return (
    <AppLayout>
      <SettingsLayout>
        <WebsiteSettings websiteId={id} />
      </SettingsLayout>
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      disabled: !!process.env.CLOUD_MODE,
    },
  };
}
