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
  const props = { websiteId, limit: 10, allowDownload: false };

  return (
    <Grid gap="3">
      <GridRow layout="two">
        <Panel>
          <PagesTable {...props} />
        </Panel>
        <Panel>
          <ReferrersTable {...props} />
        </Panel>
      </GridRow>
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
          <WorldMap websiteId={websiteId} />
        </Panel>
        <Panel>
          <CountriesTable {...props} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
