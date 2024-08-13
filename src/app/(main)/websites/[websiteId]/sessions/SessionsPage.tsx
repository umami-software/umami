'use client';
import WebsiteHeader from '../WebsiteHeader';
import SessionsDataTable from './SessionsDataTable';
import SessionsMetricsBar from './SessionsMetricsBar';
import WorldMap from 'components/metrics/WorldMap';
import { GridRow } from 'components/layout/Grid';

export function SessionsPage({ websiteId }) {
  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <SessionsMetricsBar websiteId={websiteId} />
      <GridRow columns="one">
        <WorldMap websiteId={websiteId} style={{ width: 800, margin: '0 auto' }} />
      </GridRow>
      <SessionsDataTable websiteId={websiteId} />
    </>
  );
}

export default SessionsPage;
