import { Metadata } from 'next';
import EventDataPage from './EventDataPage';

export default async function ({ params: { websiteId } }) {
  return <EventDataPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Event Data',
};
