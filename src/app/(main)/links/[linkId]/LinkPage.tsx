'use client';
import { PageBody } from '@/components/common/PageBody';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { LinkPanels } from '@/app/(main)/links/[linkId]/LinkPanels';

export function LinkPage({ linkId }: { linkId: string }) {
  return (
    <LinkProvider linkId={linkId}>
      <PageBody gap>
        <LinkHeader />
        <LinkControls linkId={linkId} />
        <LinkMetricsBar linkId={linkId} showChange={true} />
        <Panel>
          <WebsiteChart websiteId={linkId} />
        </Panel>
        <LinkPanels linkId={linkId} />
      </PageBody>
    </LinkProvider>
  );
}
