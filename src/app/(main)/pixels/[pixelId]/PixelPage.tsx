'use client';
import { PageBody } from '@/components/common/PageBody';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { PixelHeader } from '@/app/(main)/pixels/[pixelId]/PixelHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PixelMetricsBar } from '@/app/(main)/pixels/[pixelId]/PixelMetricsBar';
import { PixelControls } from '@/app/(main)/pixels/[pixelId]/PixelControls';
import { PixelPanels } from '@/app/(main)/pixels/[pixelId]/PixelPanels';
import { Column, Grid } from '@umami/react-zen';
import { ExpandedViewModal } from '@/app/(main)/websites/[websiteId]/ExpandedViewModal';

const excludedIds = ['path', 'entry', 'exit', 'title', 'language', 'screen', 'event'];

export function PixelPage({ pixelId }: { pixelId: string }) {
  return (
    <PixelProvider pixelId={pixelId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <PixelHeader />
            <PixelControls pixelId={pixelId} />
            <PixelMetricsBar pixelId={pixelId} showChange={true} />
            <Panel>
              <WebsiteChart websiteId={pixelId} />
            </Panel>
            <PixelPanels pixelId={pixelId} />
          </PageBody>
          <ExpandedViewModal websiteId={pixelId} excludedIds={excludedIds} />
        </Column>
      </Grid>
    </PixelProvider>
  );
}
