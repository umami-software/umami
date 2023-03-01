import AppLayout from 'components/layout/AppLayout';
import WebsitesList from 'components/pages/settings/websites/WebsitesList';

export default function WebsitesPage({ disabled }) {
  if (disabled) {
    return null;
  }

  return (
    <AppLayout>
      <WebsitesList />
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
