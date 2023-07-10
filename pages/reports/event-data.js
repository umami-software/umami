import AppLayout from 'components/layout/AppLayout';
import EventDataReport from 'components/pages/reports/event-data/EventDataReport';
import { useMessages } from 'hooks';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={`${formatMessage(labels.eventData)} - ${formatMessage(labels.reports)}`}>
      <EventDataReport />
    </AppLayout>
  );
}
