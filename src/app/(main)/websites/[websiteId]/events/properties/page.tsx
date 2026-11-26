import type { Metadata } from 'next';
import { EventsPropertiesPage } from './EventsPropertiesPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <EventsPropertiesPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Event Properties',
};
