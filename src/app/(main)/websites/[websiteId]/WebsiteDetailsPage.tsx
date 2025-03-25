'use client';
import { Column } from '@umami/react-zen';
import { Panel } from '@/components/layout/Panel';
import { FilterTags } from '@/components/metrics/FilterTags';
import { useNavigation } from '@/components/hooks';
import { FILTER_COLUMNS } from '@/lib/constants';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteExpandedView } from './WebsiteExpandedView';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsiteTableView } from './WebsiteTableView';

export function WebsiteDetailsPage({ websiteId }: { websiteId: string }) {
  const { query } = useNavigation();
  const { view } = query;

  const params = Object.keys(query).reduce((obj, key) => {
    if (FILTER_COLUMNS[key]) {
      obj[key] = query[key];
    }
    return obj;
  }, {});

  return (
    <Column gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <FilterTags websiteId={websiteId} params={params} />
      <WebsiteMetricsBar websiteId={websiteId} showFilter={true} showChange={true} />
      <Panel>
        <WebsiteChart websiteId={websiteId} />
      </Panel>
      {!view && <WebsiteTableView websiteId={websiteId} />}
      {view && <WebsiteExpandedView websiteId={websiteId} />}
    </Column>
  );
}
