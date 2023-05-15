import AppLayout from 'components/layout/AppLayout';
import SettingsLayout from 'components/layout/SettingsLayout';
import FunnelPage from 'components/pages/reports/FunnelPage';
import useMessages from 'hooks/useMessages';

export default function DetailsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.reports)}`}>
      <SettingsLayout>
        <FunnelPage />
      </SettingsLayout>
    </AppLayout>
  );
}
