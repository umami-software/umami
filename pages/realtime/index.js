import AppLayout from 'components/layout/AppLayout';
import RealtimeHome from 'components/pages/realtime/RealtimeHome';
import useMessages from 'hooks/useMessages';

export default function RealtimePage() {
  const { formatMessage, labels } = useMessages();
  return (
    <AppLayout title={formatMessage(labels.realtime)}>
      <RealtimeHome />
    </AppLayout>
  );
}
