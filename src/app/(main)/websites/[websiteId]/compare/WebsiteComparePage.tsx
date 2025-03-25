'use client';
import { Grid } from '@umami/react-zen';
import { Panel } from '@/components/layout/Panel';
import { WebsiteHeader } from '../WebsiteHeader';
import { WebsiteMetricsBar } from '../WebsiteMetricsBar';
import { FilterTags } from '@/components/metrics/FilterTags';
import { useNavigation } from '@/components/hooks';
import { FILTER_COLUMNS } from '@/lib/constants';
import { WebsiteChart } from '../WebsiteChart';
import { WebsiteCompareTables } from './WebsiteCompareTables';

export function WebsiteComparePage({ websiteId }) {
  const { query } = useNavigation();

  const params = Object.keys(query).reduce((obj, key) => {
    if (FILTER_COLUMNS[key]) {
      obj[key] = query[key];
    }
    return obj;
  }, {});

  return (
    <Grid gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <FilterTags websiteId={websiteId} params={params} />
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
