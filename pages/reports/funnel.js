import AppLayout from 'components/layout/AppLayout';
import FunnelReport from 'components/pages/reports/funnel/FunnelReport';
import useMessages from 'hooks/useMessages';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={`${formatMessage(labels.funnel)} - ${formatMessage(labels.reports)}`}>
      <FunnelReport />
    </AppLayout>
  );
}
