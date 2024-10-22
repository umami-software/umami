import MetricsTable from './MetricsTable';
import useMessages from 'components/hooks/useMessages';

export function EventsTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  function handleDataLoad(data) {
    props.onDataLoad?.(data);
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.events)}
      type="event"
      metric={formatMessage(labels.actions)}
      websiteId={websiteId}
      onDataLoad={handleDataLoad}
    />
  );
}

export default EventsTable;
