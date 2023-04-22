import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import RealtimeDashboard from 'components/pages/realtime/RealtimeDashboard';
import useMessages from 'hooks/useMessages';
import useApi from 'hooks/useApi';

export default function RealtimeDetailsPage() {
  const router = useRouter();
  const { id: websiteId } = router.query;
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const { data: website } = useQuery(['websites', websiteId], () =>
    get(`/websites/${websiteId}`, { enabled: !!websiteId }),
  );
  const title = `${formatMessage(labels.realtime)}${website?.name ? ` - ${website.name}` : ''}`;

  if (!websiteId) {
    return null;
  }

  return (
    <AppLayout title={title}>
      <RealtimeDashboard key={websiteId} websiteId={websiteId} />
    </AppLayout>
  );
}
