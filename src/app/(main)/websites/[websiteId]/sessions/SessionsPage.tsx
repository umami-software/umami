'use client';
import WebsiteHeader from '../WebsiteHeader';
import SessionsDataTable from './SessionsDataTable';
import SessionsMetricsBar from './SessionsMetricsBar';

export function SessionsPage({ websiteId }) {
  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <SessionsMetricsBar websiteId={websiteId} />
      <SessionsDataTable websiteId={websiteId} />
    </>
  );
}

export default SessionsPage;
