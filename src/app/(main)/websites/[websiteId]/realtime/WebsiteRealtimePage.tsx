'use client';
import { firstBy } from 'thenby';
import { Grid } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Page } from '@/components/common/Page';
import { Panel } from '@/components/common/Panel';
import { RealtimeChart } from '@/components/metrics/RealtimeChart';
import { WorldMap } from '@/components/metrics/WorldMap';
import { useRealtimeQuery } from '@/components/hooks';
import { RealtimeLog } from './RealtimeLog';
import { RealtimeHeader } from './RealtimeHeader';
import { RealtimeUrls } from './RealtimeUrls';
import { RealtimeCountries } from './RealtimeCountries';
import { WebsiteHeader } from '../WebsiteHeader';
import { percentFilter } from '@/lib/filters';

export function WebsiteRealtimePage({ websiteId }) {
  const { data, isLoading, error } = useRealtimeQuery(websiteId);

  if (isLoading || error) {
    return <Page isLoading={isLoading} error={error} />;
  }

  const countries = percentFilter(
    Object.keys(data.countries)
      .map(key => ({ x: key, y: data.countries[key] }))
      .sort(firstBy('y', -1)),
  );

  return (
    <Grid gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <Panel>
        <RealtimeHeader data={data} />
      </Panel>
      <Panel>
        <RealtimeChart data={data} unit="minute" />
      </Panel>
      <GridRow layout="one-two">
        <Panel>
          <RealtimeUrls data={data} />
        </Panel>
        <Panel>
          <RealtimeLog data={data} />
        </Panel>
      </GridRow>
      <GridRow layout="one-two">
        <Panel>
          <RealtimeCountries data={countries} />
        </Panel>
        <Panel padding="0">
          <WorldMap data={countries} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
