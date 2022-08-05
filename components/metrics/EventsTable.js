import { defineMessages, useIntl } from 'react-intl';
import MetricsTable from './MetricsTable';
import { eventTypeFilter } from 'lib/filters';

const messages = defineMessages({
  events: { id: 'metrics.events', defaultMessage: 'Events' },
  actions: { id: 'metrics.actions', defaultMessage: 'Actions' },
});

export default function EventsTable({ websiteId, ...props }) {
  const { formatMessage } = useIntl();

  function handleDataLoad(data) {
    props.onDataLoad?.(data);
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(messages.events)}
      type="event"
      metric={formatMessage(messages.actions)}
      websiteId={websiteId}
      dataFilter={eventTypeFilter}
      onDataLoad={handleDataLoad}
    />
  );
}
