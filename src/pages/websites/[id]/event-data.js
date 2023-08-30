import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteEventDataPage from 'components/pages/websites/WebsiteEventDataPage';
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
      <WebsiteEventDataPage websiteId={id} />
    </AppLayout>
  );
}
