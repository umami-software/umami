'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { EventsChart } from '@/components/metrics/EventsChart';
import { EventCountsTable } from './EventCountsTable';
import { EventsMetricsBar } from './EventsMetricsBar';

export function EventsPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <Panel>
        <EventsChart websiteId={websiteId} limit={50} allowBarDrill={true} />
      </Panel>
      <EventCountsTable websiteId={websiteId} limit={50} />
    </Column>
  );
}
