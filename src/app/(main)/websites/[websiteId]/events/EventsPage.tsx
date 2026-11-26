'use client';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { EventsLayout } from './EventsLayout';

export function EventsPage({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <EventsLayout websiteId={websiteId}>
      <Column gap="6">
        <Column border="bottom" paddingBottom="6">
          <EventsChart websiteId={websiteId} limit={50} allowBarDrill={true} />
        </Column>
        <MetricsTable
          websiteId={websiteId}
          type="event"
          title={t(labels.event)}
          metric={t(labels.count)}
          limit={50}
        />
      </Column>
    </EventsLayout>
  );
}
