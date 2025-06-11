import { Grid } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { PagesTable } from '@/components/metrics/PagesTable';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { OSTable } from '@/components/metrics/OSTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CountriesTable } from '@/components/metrics/CountriesTable';

export function WebsiteTableView({ websiteId }: { websiteId: string }) {
  return (
    <Grid gap="3">
      <GridRow layout="two">
        <Panel>
          <PagesTable websiteId={websiteId} limit={10} />
        </Panel>
        <Panel>
          <ReferrersTable websiteId={websiteId} limit={10} />
        </Panel>
      </GridRow>
      <GridRow layout="three">
        <Panel>
          <BrowsersTable websiteId={websiteId} limit={10} />
        </Panel>
        <Panel>
          <OSTable websiteId={websiteId} limit={10} />
        </Panel>
        <Panel>
          <DevicesTable websiteId={websiteId} limit={10} />
        </Panel>
      </GridRow>
      <GridRow layout="two-one">
        <Panel gridColumn="span 2" noPadding>
          <WorldMap websiteId={websiteId} />
        </Panel>
        <Panel>
          <CountriesTable websiteId={websiteId} limit={10} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
