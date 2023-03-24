import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import WebsitesList from 'components/pages/settings/websites/WebsitesList';

export default function WebsitesPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <AppLayout>
      <SettingsLayout>
        <WebsitesList />
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
