import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteDetailsPage from 'components/pages/websites/WebsiteDetailsPage';
import useMessages from 'components/hooks/useMessages';

export default function () {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return null;
  }

  return (
    <AppLayout title={formatMessage(labels.websites)}>
      <WebsiteDetailsPage websiteId={id} />
    </AppLayout>
  );
}
