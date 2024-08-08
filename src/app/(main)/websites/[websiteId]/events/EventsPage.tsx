'use client';
import WebsiteHeader from '../WebsiteHeader';
import EventsDataTable from './EventsDataTable';
import EventsMetricsBar from './EventsMetricsBar';
import EventsChart from 'components/metrics/EventsChart';
import { GridRow } from 'components/layout/Grid';
import MetricsTable from 'components/metrics/MetricsTable';
import { useMessages } from 'components/hooks';

export default function EventsPage({ websiteId }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <GridRow columns="two-one">
        <EventsChart websiteId={websiteId} />
        <MetricsTable
          websiteId={websiteId}
          type="event"
          title={formatMessage(labels.events)}
          metric={formatMessage(labels.actions)}
        />
      </GridRow>
      <GridRow columns="one">
        <EventsDataTable websiteId={websiteId} />
      </GridRow>
    </>
  );
}
