'use client';
import { Grid, GridRow } from 'components/layout/Grid';
import Page from 'components/layout/Page';
import RealtimeChart from 'components/metrics/RealtimeChart';
import WorldMap from 'components/metrics/WorldMap';
import { useRealtime } from 'components/hooks';
import RealtimeLog from './RealtimeLog';
import RealtimeHeader from './RealtimeHeader';
import RealtimeUrls from './RealtimeUrls';
import RealtimeCountries from './RealtimeCountries';
import WebsiteHeader from '../WebsiteHeader';
import WebsiteProvider from '../WebsiteProvider';

export function WebsiteRealtimePage({ websiteId }) {
  const { data, isLoading, error } = useRealtime(websiteId);

  if (isLoading || error) {
    return <Page isLoading={isLoading} error={error} />;
  }

  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteHeader websiteId={websiteId} />
      <RealtimeHeader data={data} />
      <RealtimeChart data={data} unit="minute" />
      <Grid>
        <GridRow columns="one-two">
          <RealtimeUrls data={data} />
          <RealtimeLog data={data} />
        </GridRow>
        <GridRow columns="one-two">
          <RealtimeCountries data={data?.countries} />
          <WorldMap data={data?.countries} />
        </GridRow>
      </Grid>
    </WebsiteProvider>
  );
}

export default WebsiteRealtimePage;
