import AppLayout from 'components/layout/AppLayout';
import FunnelPage from 'components/pages/reports/funnel/FunnelPage';
import useMessages from 'hooks/useMessages';

export default function Funnel() {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={`${formatMessage(labels.settings)} - ${formatMessage(labels.reports)}`}>
      <FunnelPage />
    </AppLayout>
  );
}
