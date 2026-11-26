'use client';
import { Column, Grid } from '@umami/react-zen';
import { PixelControls } from '@/app/(main)/pixels/[pixelId]/PixelControls';
import { PixelHeader } from '@/app/(main)/pixels/[pixelId]/PixelHeader';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { WebsiteExpandedView } from '@/app/(main)/websites/[websiteId]/WebsiteExpandedView';
import { PageBody } from '@/components/common/PageBody';

export function PixelMetricsPage({
  pixelId,
  showHeaderActions = true,
}: {
  pixelId: string;
  showHeaderActions?: boolean;
}) {
  return (
    <PixelProvider pixelId={pixelId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <PixelHeader showActions={showHeaderActions} />
            <Column gap>
              <PixelControls pixelId={pixelId} />
              <WebsiteExpandedView websiteId={pixelId} />
            </Column>
          </PageBody>
        </Column>
      </Grid>
    </PixelProvider>
  );
}
