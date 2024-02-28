import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { useMessages } from 'components/hooks';

export function EventsTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  function handleDataLoad(data: any) {
    props.onDataLoad?.(data);
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.events)}
      type="event"
      metric={formatMessage(labels.actions)}
      onDataLoad={handleDataLoad}
    />
  );
}

export default EventsTable;
