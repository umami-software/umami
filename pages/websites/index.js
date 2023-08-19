import AppLayout from 'components/layout/AppLayout';
import WebsitesPage from 'components/pages/websites/WebsitesPage';
import useMessages from 'hooks/useMessages';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.websites)}>
      <WebsitesPage />
    </AppLayout>
  );
}
