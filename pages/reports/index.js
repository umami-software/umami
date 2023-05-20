import AppLayout from 'components/layout/AppLayout';
import ReportList from 'components/pages/reports/ReportList';
import useMessages from 'hooks/useMessages';

export default function ReportsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <ReportList />
    </AppLayout>
  );
}
