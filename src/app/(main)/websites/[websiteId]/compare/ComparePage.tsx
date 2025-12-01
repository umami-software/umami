'use client';
import { Column } from '@umami/react-zen';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { WebsiteMetricsBar } from '@/app/(main)/websites/[websiteId]/WebsiteMetricsBar';
import { Panel } from '@/components/common/Panel';
import { CompareTables } from './CompareTables';

export function ComparePage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowCompare={true} />
      <WebsiteMetricsBar websiteId={websiteId} showChange={true} />
      <Panel minHeight="520px">
        <WebsiteChart websiteId={websiteId} compareMode={true} />
      </Panel>
      <CompareTables websiteId={websiteId} />
    </Column>
  );
}
