import { Metadata } from 'next';
import EventsPage from './EventsPage';

export default async function ({ params: { websiteId } }) {
  return <EventsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Event Data',
};
