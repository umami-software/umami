'use client';
import { EventsDataTable } from '../EventsDataTable';
import { EventsLayout } from '../EventsLayout';

export function EventsActivityPage({ websiteId }: { websiteId: string }) {
  return (
    <EventsLayout websiteId={websiteId}>
      <EventsDataTable websiteId={websiteId} />
    </EventsLayout>
  );
}
