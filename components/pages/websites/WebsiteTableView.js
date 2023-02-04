import { useState } from 'react';
import { Row, Column } from 'react-basics';
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
      <Row>
        <Column variant="two">
          <PagesTable {...tableProps} />
        </Column>
        <Column variant="two">
          <ReferrersTable {...tableProps} />
        </Column>
      </Row>
      <Row>
        <Column variant="three">
          <BrowsersTable {...tableProps} />
        </Column>
        <Column variant="three">
          <OSTable {...tableProps} />
        </Column>
        <Column variant="three">
          <DevicesTable {...tableProps} />
        </Column>
      </Row>
      <Row>
        <Column xs={12} sm={12} md={12} defaultSize={8}>
          <WorldMap data={countryData} />
        </Column>
        <Column xs={12} sm={12} md={12} defaultSize={4}>
          <CountriesTable {...tableProps} onDataLoad={setCountryData} />
        </Column>
      </Row>
      <Row>
        <Column xs={12} md={12} lg={4} defaultSize={4}>
          <EventsTable {...tableProps} />
        </Column>
        <Column xs={12} md={12} lg={8} defaultSize={8}>
          <EventsChart websiteId={websiteId} />
        </Column>
      </Row>
    </>
  );
}
