'use client';
import { firstBy } from 'thenby';
import { Grid, GridRow } from '@/components/layout/Grid';
import Page from '@/components/layout/Page';
import RealtimeChart from '@/components/metrics/RealtimeChart';
import WorldMap from '@/components/metrics/WorldMap';
import { useRealtime } from '@/components/hooks';
import RealtimeLog from './RealtimeLog';
import RealtimeHeader from './RealtimeHeader';
import RealtimeUrls from './RealtimeUrls';
import RealtimeCountries from './RealtimeCountries';
import WebsiteHeader from '../WebsiteHeader';
import { percentFilter } from '@/lib/filters';

export function WebsiteRealtimePage({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useRealtime(websiteId);

  if (isLoading || error) {
    return <Page isLoading={isLoading} error={error} />;
  }

  const countries = percentFilter(
    Object.keys(data.countries)
      .map(key => ({ x: key, y: data.countries[key] }))
      .sort(firstBy('y', -1)),
  );

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <RealtimeHeader data={data} />
      <RealtimeChart data={data} unit="minute" />
      <Grid>
        <GridRow columns="one-two">
          <RealtimeUrls data={data} />
          <RealtimeLog data={data} />
        </GridRow>
        <GridRow columns="one-two">
          <RealtimeCountries data={countries} />
          <WorldMap data={countries} />
        </GridRow>
      </Grid>
    </>
  );
}

export default WebsiteRealtimePage;
