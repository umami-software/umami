import AppLayout from 'components/layout/AppLayout';
import useMessages from 'hooks/useMessages';
import ReportsList from 'components/pages/reports/ReportsList';

export default function ReportsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <ReportsList />
    </AppLayout>
  );
}
