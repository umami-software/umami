'use client';
import { Column, Grid } from '@umami/react-zen';
import { PixelControls } from '@/app/(main)/pixels/[pixelId]/PixelControls';
import { PixelHeader } from '@/app/(main)/pixels/[pixelId]/PixelHeader';
import { PixelMetricsBar } from '@/app/(main)/pixels/[pixelId]/PixelMetricsBar';
import { PixelPanels } from '@/app/(main)/pixels/[pixelId]/PixelPanels';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { ExpandedViewModal } from '@/app/(main)/websites/[websiteId]/ExpandedViewModal';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';

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
