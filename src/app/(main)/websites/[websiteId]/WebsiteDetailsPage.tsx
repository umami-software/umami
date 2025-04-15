'use client';
import { Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useNavigation } from '@/components/hooks';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteExpandedView } from './WebsiteExpandedView';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsiteTableView } from './WebsiteTableView';

export function WebsiteDetailsPage({ websiteId }: { websiteId: string }) {
  const {
    query: { view, compare },
  } = useNavigation();

  return (
    <Column gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <Panel>
        <WebsiteMetricsBar websiteId={websiteId} showFilter={true} showChange={true} />
      </Panel>
      <Panel>
        <WebsiteChart websiteId={websiteId} compareMode={compare} />
      </Panel>
      {!view && <WebsiteTableView websiteId={websiteId} />}
      {view && <WebsiteExpandedView websiteId={websiteId} />}
    </Column>
  );
}
