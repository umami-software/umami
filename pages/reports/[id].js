import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import FunnelReport from 'components/pages/reports/funnel/FunnelReport';
import useMessages from 'hooks/useMessages';

export default function ReportsPage() {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return null;
  }

  return (
    <AppLayout title={formatMessage(labels.websites)}>
      <FunnelReport reportId={id} />
    </AppLayout>
  );
}
