'use client';
import WebsiteHeader from '../WebsiteHeader';
import WebsiteEventData from './WebsiteEventData';

export default function EventDataPage({ websiteId }) {
  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteEventData websiteId={websiteId} />
    </>
  );
}
