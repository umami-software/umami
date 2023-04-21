import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import WebsitesList from 'components/pages/settings/websites/WebsitesList';
import useMessages from 'hooks/useMessages';

export default function WebsitesPage({ disabled }) {
  const { formatMessage, labels } = useMessages();
  if (disabled) {
    return null;
  }

  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.websites)}`}>
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
