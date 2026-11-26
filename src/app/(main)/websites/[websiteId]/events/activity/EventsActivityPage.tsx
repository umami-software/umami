'use client';
import { Column } from '@umami/react-zen';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { EventsDataTable } from '../EventsDataTable';

export function EventsActivityPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <EventsDataTable websiteId={websiteId} />
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
