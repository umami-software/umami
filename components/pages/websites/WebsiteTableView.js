import { useState } from 'react';
import { GridRow, GridColumn } from 'components/layout/Grid';
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
    <>
      <GridRow>
        <GridColumn variant="two">
          <PagesTable {...tableProps} />
        </GridColumn>
        <GridColumn variant="two">
          <ReferrersTable {...tableProps} />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn variant="three">
          <BrowsersTable {...tableProps} />
        </GridColumn>
        <GridColumn variant="three">
          <OSTable {...tableProps} />
        </GridColumn>
        <GridColumn variant="three">
          <DevicesTable {...tableProps} />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn xs={12} sm={12} md={12} defaultSize={8}>
          <WorldMap data={countryData} />
        </GridColumn>
        <GridColumn xs={12} sm={12} md={12} defaultSize={4}>
          <CountriesTable {...tableProps} onDataLoad={setCountryData} />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn xs={12} sm={12} md={12} lg={4} defaultSize={4}>
          <EventsTable {...tableProps} />
        </GridColumn>
        <GridColumn xs={12} sm={12} md={12} lg={8} defaultSize={8}>
          <EventsChart websiteId={websiteId} />
        </GridColumn>
      </GridRow>
    </>
  );
}
