'use client';
import { Column } from '@umami/react-zen';
import { useNavigation } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
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
      <WebsiteMetricsBar websiteId={websiteId} showChange={true} />
      <Panel>
        <WebsiteChart websiteId={websiteId} compareMode={compare} />
      </Panel>
      {!view && !compare && <WebsiteTableView websiteId={websiteId} />}
      {view && !compare && <WebsiteExpandedView websiteId={websiteId} />}
      {compare && <WebsiteCompareTables websiteId={websiteId} />}
    </Column>
  );
}
