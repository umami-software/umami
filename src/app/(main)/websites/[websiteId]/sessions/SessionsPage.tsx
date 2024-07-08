'use client';
import WebsiteHeader from '../WebsiteHeader';
import SessionsDataTable from './SessionsDataTable';

export function SessionsPage({ websiteId }) {
  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <SessionsDataTable websiteId={websiteId} />
    </>
  );
}

export default SessionsPage;
