import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import WebsiteChart from 'components/metrics/WebsiteChart';
import WorldMap from 'components/common/WorldMap';
import Page from 'components/layout/Page';
import GridLayout, { GridRow, GridColumn } from 'components/layout/GridLayout';
import MenuLayout from 'components/layout/MenuLayout';
import Link from 'components/common/Link';
import Loading from 'components/common/Loading';
import Arrow from 'assets/arrow-right.svg';
import PagesTable from 'components/metrics/PagesTable';
import ReferrersTable from 'components/metrics/ReferrersTable';
import BrowsersTable from 'components/metrics/BrowsersTable';
import OSTable from 'components/metrics/OSTable';
import DevicesTable from 'components/metrics/DevicesTable';
import CountriesTable from 'components/metrics/CountriesTable';
import LanguagesTable from 'components/metrics/LanguagesTable';
import EventsTable from 'components/metrics/EventsTable';
import EventsChart from 'components/metrics/EventsChart';
import useFetch from 'hooks/useFetch';
import usePageQuery from 'hooks/usePageQuery';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import styles from './WebsiteDetails.module.css';

const views = {
  url: PagesTable,
  referrer: ReferrersTable,
  browser: BrowsersTable,
  os: OSTable,
  device: DevicesTable,
  country: CountriesTable,
  language: LanguagesTable,
  event: EventsTable,
};

export default function WebsiteDetails({ websiteId }) {
  const { data } = useFetch(`/website/${websiteId}`);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [eventsData, setEventsData] = useState();
  const {
    resolve,
    query: { view },
  } = usePageQuery();

  const BackButton = () => (
    <div key="back-button" className={classNames(styles.backButton, 'col-12')}>
      <Link key="back-button" href={resolve({ view: undefined })} icon={<Arrow />} size="small">
        <FormattedMessage id="label.back" defaultMessage="Back" />
      </Link>
    </div>
  );

  const menuOptions = [
    {
      render: BackButton,
    },
    {
      label: <FormattedMessage id="metrics.pages" defaultMessage="Pages" />,
      value: resolve({ view: 'url' }),
    },
    {
      label: <FormattedMessage id="metrics.referrers" defaultMessage="Referrers" />,
      value: resolve({ view: 'referrer' }),
    },
    {
      label: <FormattedMessage id="metrics.browsers" defaultMessage="Browsers" />,
      value: resolve({ view: 'browser' }),
    },
    {
      label: <FormattedMessage id="metrics.operating-systems" defaultMessage="Operating system" />,
      value: resolve({ view: 'os' }),
    },
    {
      label: <FormattedMessage id="metrics.devices" defaultMessage="Devices" />,
      value: resolve({ view: 'device' }),
    },
    {
      label: <FormattedMessage id="metrics.countries" defaultMessage="Countries" />,
      value: resolve({ view: 'country' }),
    },
    {
      label: <FormattedMessage id="metrics.languages" defaultMessage="Languages" />,
      value: resolve({ view: 'language' }),
    },
    {
      label: <FormattedMessage id="metrics.events" defaultMessage="Events" />,
      value: resolve({ view: 'event' }),
    },
  ];

  const tableProps = {
    websiteId,
    websiteDomain: data?.domain,
    limit: 10,
  };

  const DetailsComponent = views[view];

  function handleDataLoad() {
    if (!chartLoaded) {
      setTimeout(() => setChartLoaded(true), DEFAULT_ANIMATION_DURATION);
    }
  }

  if (!data) {
    return null;
  }

  return (
    <Page>
      <div className="row">
        <div className={classNames(styles.chart, 'col')}>
          <WebsiteChart
            websiteId={websiteId}
            title={data.name}
            domain={data.domain}
            onDataLoad={handleDataLoad}
            showLink={false}
            stickyHeader
          />
          {!chartLoaded && <Loading />}
        </div>
      </div>
      {chartLoaded && !view && (
        <GridLayout>
          <GridRow>
            <GridColumn md={12} lg={6}>
              <PagesTable {...tableProps} />
            </GridColumn>
            <GridColumn md={12} lg={6}>
              <ReferrersTable {...tableProps} />
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn md={12} lg={4}>
              <BrowsersTable {...tableProps} />
            </GridColumn>
            <GridColumn md={12} lg={4}>
              <OSTable {...tableProps} />
            </GridColumn>
            <GridColumn md={12} lg={4}>
              <DevicesTable {...tableProps} />
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn xs={12} md={12} lg={8}>
              <WorldMap data={countryData} />
            </GridColumn>
            <GridColumn xs={12} md={12} lg={4}>
              <CountriesTable {...tableProps} onDataLoad={setCountryData} />
            </GridColumn>
          </GridRow>
          <GridRow className={classNames({ [styles.hidden]: !eventsData?.length > 0 })}>
            <GridColumn xs={12} md={12} lg={4}>
              <EventsTable {...tableProps} onDataLoad={setEventsData} />
            </GridColumn>
            <GridColumn xs={12} md={12} lg={8}>
              <EventsChart className={styles.eventschart} websiteId={websiteId} />
            </GridColumn>
          </GridRow>
        </GridLayout>
      )}
      {view && chartLoaded && (
        <MenuLayout
          className={styles.view}
          menuClassName={styles.menu}
          contentClassName={styles.content}
          menu={menuOptions}
        >
          <DetailsComponent
            {...tableProps}
            height={500}
            limit={false}
            animte={false}
            showFilters
            virtualize
          />
        </MenuLayout>
      )}
    </Page>
  );
}
