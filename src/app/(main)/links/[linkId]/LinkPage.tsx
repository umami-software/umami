'use client';
import { Column, Grid } from '@umami/react-zen';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { LinkPanels } from '@/app/(main)/links/[linkId]/LinkPanels';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { ExpandedViewModal } from '@/app/(main)/websites/[websiteId]/ExpandedViewModal';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';

const excludedIds = ['path', 'entry', 'exit', 'title', 'language', 'screen', 'event'];

export function LinkPage({ linkId }: { linkId: string }) {
  return (
    <LinkProvider linkId={linkId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <LinkHeader />
            <LinkControls linkId={linkId} />
            <LinkMetricsBar linkId={linkId} showChange={true} />
            <Panel>
              <WebsiteChart websiteId={linkId} />
            </Panel>
            <LinkPanels linkId={linkId} />
          </PageBody>
          <ExpandedViewModal websiteId={linkId} excludedIds={excludedIds} />
        </Column>
      </Grid>
    </LinkProvider>
  );
}
