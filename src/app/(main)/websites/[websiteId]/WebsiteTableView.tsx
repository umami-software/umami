import { Grid, GridRow } from '@/components/layout/Grid';
import PagesTable from '@/components/metrics/PagesTable';
import ReferrersTable from '@/components/metrics/ReferrersTable';
import BrowsersTable from '@/components/metrics/BrowsersTable';
import OSTable from '@/components/metrics/OSTable';
import DevicesTable from '@/components/metrics/DevicesTable';
import WorldMap from '@/components/metrics/WorldMap';
import CountriesTable from '@/components/metrics/CountriesTable';
import EventsTable from '@/components/metrics/EventsTable';
import EventsChart from '@/components/metrics/EventsChart';
import { usePathname } from 'next/navigation';

export default function WebsiteTableView({ websiteId }: { websiteId: string }) {
  const pathname = usePathname();
  const tableProps = {
    websiteId,
    limit: 10,
  };
  const isSharePage = pathname.includes('/share/');

  return (
    <Grid>
      <GridRow columns="two">
        <PagesTable {...tableProps} />
        <ReferrersTable {...tableProps} />
      </GridRow>
      <GridRow columns="three">
        <BrowsersTable {...tableProps} />
        <OSTable {...tableProps} />
        <DevicesTable {...tableProps} />
      </GridRow>
      <GridRow columns="two-one">
        <WorldMap websiteId={websiteId} />
        <CountriesTable {...tableProps} />
      </GridRow>
      {isSharePage && (
        <GridRow columns="one-two">
          <EventsTable {...tableProps} />
          <EventsChart websiteId={websiteId} />
        </GridRow>
      )}
    </Grid>
  );
}
