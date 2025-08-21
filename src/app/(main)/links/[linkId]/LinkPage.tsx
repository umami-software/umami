'use client';
import { PageBody } from '@/components/common/PageBody';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { LinkHeader } from '@/app/(main)/links/[linkId]/LinkHeader';
import { Panel } from '@/components/common/Panel';
import { WebsiteChart } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { LinkMetricsBar } from '@/app/(main)/links/[linkId]/LinkMetricsBar';
import { LinkControls } from '@/app/(main)/links/[linkId]/LinkControls';
import { Grid } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { OSTable } from '@/components/metrics/OSTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CountriesTable } from '@/components/metrics/CountriesTable';

export function LinkPage({ linkId }: { linkId: string }) {
  const props = { websiteId: linkId, limit: 10, allowDownload: false };

  return (
    <LinkProvider linkId={linkId}>
      <PageBody gap>
        <LinkHeader />
        <LinkControls linkId={linkId} />
        <LinkMetricsBar linkId={linkId} showChange={true} />
        <Panel>
          <WebsiteChart websiteId={linkId} />
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
              <WorldMap websiteId={linkId} />
            </Panel>
            <Panel>
              <CountriesTable {...props} />
            </Panel>
          </GridRow>
        </Grid>
      </PageBody>
    </LinkProvider>
  );
}
