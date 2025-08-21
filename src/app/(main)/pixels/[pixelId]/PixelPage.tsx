'use client';
import { PageBody } from '@/components/common/PageBody';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { PixelHeader } from '@/app/(main)/pixels/[pixelId]/PixelHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { PixelMetricsBar } from '@/app/(main)/pixels/[pixelId]/PixelMetricsBar';
import { PixelControls } from '@/app/(main)/pixels/[pixelId]/PixelControls';
import { Grid } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { OSTable } from '@/components/metrics/OSTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CountriesTable } from '@/components/metrics/CountriesTable';

export function PixelPage({ pixelId }: { pixelId: string }) {
  const props = { websiteId: pixelId, limit: 10, allowDownload: false };

  return (
    <PixelProvider pixelId={pixelId}>
      <PageBody gap>
        <PixelHeader />
        <PixelControls pixelId={pixelId} />
        <PixelMetricsBar pixelId={pixelId} showChange={true} />
        <Panel>
          <WebsiteChart websiteId={pixelId} />
        </Panel>
        <GridRow layout="two">
          <Panel>
            <ReferrersTable {...props} />
          </Panel>
        </GridRow>
        <Grid gap="3">
          <GridRow layout="three">
            <Panel>
              <BrowsersTable {...props} />
            </Panel>
            <Panel>
              <OSTable {...props} />
            </Panel>
            <Panel>
              <DevicesTable {...props} />
            </Panel>
          </GridRow>
          <GridRow layout="two-one">
            <Panel gridColumn="span 2" noPadding>
              <WorldMap websiteId={pixelId} />
            </Panel>
            <Panel>
              <CountriesTable {...props} />
            </Panel>
          </GridRow>
        </Grid>
      </PageBody>
    </PixelProvider>
  );
}
