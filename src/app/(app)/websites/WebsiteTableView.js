import { useState } from 'react';
import { Grid, GridRow } from 'components/layout/Grid';
import PagesTable from 'components/metrics/PagesTable';
import ReferrersTable from 'components/metrics/ReferrersTable';
import BrowsersTable from 'components/metrics/BrowsersTable';
import OSTable from 'components/metrics/OSTable';
import DevicesTable from 'components/metrics/DevicesTable';
import WorldMap from 'components/common/WorldMap';
import CountriesTable from 'components/metrics/CountriesTable';
import EventsTable from 'components/metrics/EventsTable';
import EventsChart from 'components/metrics/EventsChart';

export default function WebsiteTableView({ websiteId }) {
  const [countryData, setCountryData] = useState();
  const tableProps = {
    websiteId,
    limit: 10,
  };

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
        <WorldMap data={countryData} />
        <CountriesTable {...tableProps} onDataLoad={setCountryData} />
      </GridRow>
      <GridRow columns="one-two">
        <EventsTable {...tableProps} />
        <EventsChart websiteId={websiteId} />
      </GridRow>
    </Grid>
  );
}
