import AppLayout from 'components/layout/AppLayout';
import RetentionReport from 'components/pages/reports/retention/RetentionReport';
import useMessages from 'components/hooks/useMessages';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={`${formatMessage(labels.retention)} - ${formatMessage(labels.reports)}`}>
      <RetentionReport />
    </AppLayout>
  );
}
