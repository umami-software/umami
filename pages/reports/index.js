import AppLayout from 'components/layout/AppLayout';
import useMessages from 'hooks/useMessages';
import ReportsPage from 'components/pages/reports/ReportsPage';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <ReportsPage />
    </AppLayout>
  );
}
