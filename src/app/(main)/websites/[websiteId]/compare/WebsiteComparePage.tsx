'use client';
import { Grid } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { WebsiteHeader } from '../WebsiteHeader';
import { WebsiteMetricsBar } from '../WebsiteMetricsBar';
import { FilterBar } from '@/components/metrics/FilterBar';
import { WebsiteChart } from '../WebsiteChart';
import { WebsiteCompareTables } from './WebsiteCompareTables';

export function WebsiteComparePage({ websiteId }) {
  return (
    <Grid gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <FilterBar websiteId={websiteId} />
      <WebsiteMetricsBar websiteId={websiteId} compareMode={true} showFilter={true} />
      <Panel>
        <WebsiteChart websiteId={websiteId} compareMode={true} />
      </Panel>
      <Panel>
        <WebsiteCompareTables websiteId={websiteId} />
      </Panel>
    </Grid>
  );
}
