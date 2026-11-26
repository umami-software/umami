'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useMessages } from '@/components/hooks';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { EventsMetricsBar } from './EventsMetricsBar';

export function EventsPage({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <Column gap="6" marginTop="3">
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
    </Column>
  );
}
