'use client';
import { Column, Grid } from '@umami/react-zen';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { LinkPanels } from '@/app/(main)/links/[linkId]/LinkPanels';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';

export function LinkPage({
  linkId,
  showHeaderActions = true,
}: {
  linkId: string;
  showHeaderActions?: boolean;
}) {
  return (
    <LinkProvider linkId={linkId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <LinkHeader showActions={showHeaderActions} />
            <LinkControls linkId={linkId} />
            <LinkMetricsBar linkId={linkId} showChange={true} />
            <Panel>
              <WebsiteChart websiteId={linkId} allowBarDrill={true} />
            </Panel>
            <LinkPanels linkId={linkId} />
          </PageBody>
        </Column>
      </Grid>
    </LinkProvider>
  );
}
