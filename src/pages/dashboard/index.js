import AppLayout from 'components/layout/AppLayout';
import Dashboard from 'components/pages/dashboard/Dashboard';
import useMessages from 'components/hooks/useMessages';

export default function DashboardPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.dashboard)}>
      <Dashboard />
    </AppLayout>
  );
}
