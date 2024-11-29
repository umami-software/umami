import { Metadata } from 'next';
import EventsPage from './EventsPage';

export default async function ({ params }: { params: { websiteId: string } }) {
  const { websiteId } = await params;

  return <EventsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Event Data',
};
