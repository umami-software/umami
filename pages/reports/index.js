import AppLayout from 'components/layout/AppLayout';
import ReportsList from 'components/pages/reports/ReportsList';
import useMessages from 'hooks/useMessages';

export default function ReportsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <ReportsList />
    </AppLayout>
  );
}
