'use client';
import { EventProperties } from '../EventProperties';
import { EventsLayout } from '../EventsLayout';

export function EventsPropertiesPage({ websiteId }: { websiteId: string }) {
  return (
    <EventsLayout websiteId={websiteId}>
      <EventProperties websiteId={websiteId} />
    </EventsLayout>
  );
}
