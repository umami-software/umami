import AppLayout from 'components/layout/AppLayout';
import InsightsReport from 'components/pages/reports/insights/InsightsReport';
import { useMessages } from 'hooks';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={`${formatMessage(labels.insights)} - ${formatMessage(labels.reports)}`}>
      <InsightsReport />
    </AppLayout>
  );
}
