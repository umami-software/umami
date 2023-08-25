import AppLayout from 'components/layout/AppLayout';
import ReportsPage from 'components/pages/reports/ReportsPage';
import { useMessages } from 'components/hooks';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <ReportsPage />
    </AppLayout>
  );
}
