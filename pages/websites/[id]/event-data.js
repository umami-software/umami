import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteEventData from 'components/pages/websites/WebsiteEventData';
import useMessages from 'hooks/useMessages';

export default function () {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return null;
  }

  return (
    <AppLayout title={formatMessage(labels.websites)}>
      <WebsiteEventData websiteId={id} />
    </AppLayout>
  );
}
