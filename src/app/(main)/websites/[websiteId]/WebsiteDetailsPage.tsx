'use client';
import { Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useNavigation } from '@/components/hooks';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteExpandedView } from './WebsiteExpandedView';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsiteTableView } from './WebsiteTableView';
import { WebsiteCompareTables } from './WebsiteCompareTables';
import { WebsiteControls } from './WebsiteControls';

export function WebsiteDetailsPage({ websiteId }: { websiteId: string }) {
  const {
    query: { view, compare },
  } = useNavigation();

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowCompare={true} />
      <Panel>
        <WebsiteMetricsBar websiteId={websiteId} showFilter={true} showChange={true} />
      </Panel>
      <Panel>
        <WebsiteChart websiteId={websiteId} compareMode={compare} />
      </Panel>
      {!view && !compare && <WebsiteTableView websiteId={websiteId} />}
      {view && !compare && <WebsiteExpandedView websiteId={websiteId} />}
      {compare && <WebsiteCompareTables websiteId={websiteId} />}
    </Column>
  );
}
