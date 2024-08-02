'use client';
import WebsiteHeader from '../WebsiteHeader';
import EventsDataTable from './EventsDataTable';

export default function EventsPage({ websiteId }) {
  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <EventsDataTable websiteId={websiteId} />
    </>
  );
}
