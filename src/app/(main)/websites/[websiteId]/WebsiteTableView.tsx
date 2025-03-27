import { Grid } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { PagesTable } from '@/components/metrics/PagesTable';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { OSTable } from '@/components/metrics/OSTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { WorldMap } from '@/components/metrics/WorldMap';
import { CountriesTable } from '@/components/metrics/CountriesTable';
import { EventsTable } from '@/components/metrics/EventsTable';
import { EventsChart } from '@/components/metrics/EventsChart';
import { usePathname } from 'next/navigation';

export function WebsiteTableView({ websiteId }: { websiteId: string }) {
  const pathname = usePathname();
  const tableProps = {
    websiteId,
    limit: 10,
  };
  const isSharePage = pathname.includes('/share/');

  return (
    <Grid gap="3">
      <Grid gap="3" columns="repeat(auto-fill, minmax(500px, 1fr))">
        <Panel>
          <PagesTable {...tableProps} />
        </Panel>
        <Panel>
          <ReferrersTable {...tableProps} />
        </Panel>
      </Grid>
      <Grid gap="3" columns="repeat(auto-fill, minmax(400px, 1fr))">
        <Panel>
          <BrowsersTable {...tableProps} />
        </Panel>
        <Panel>
          <OSTable {...tableProps} />
        </Panel>
        <Panel>
          <DevicesTable {...tableProps} />
        </Panel>
      </Grid>
      <Grid gap="3" columns="2fr 1fr">
        <Panel padding="0">
          <WorldMap websiteId={websiteId} />
        </Panel>
        <Panel>
          <CountriesTable {...tableProps} />
        </Panel>
      </Grid>
      {isSharePage && (
        <Grid gap="3">
          <Panel>
            <EventsTable {...tableProps} />
          </Panel>
          <Panel>
            <EventsChart websiteId={websiteId} />
          </Panel>
        </Grid>
      )}
    </Grid>
  );
}
