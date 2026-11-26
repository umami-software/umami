import type { Metadata } from 'next';
import { EventsActivityPage } from './EventsActivityPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <EventsActivityPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Event Activity',
};
