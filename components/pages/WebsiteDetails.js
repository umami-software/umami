import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
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
import ScreenTable from 'components/metrics/ScreenTable';
import QueryParametersTable from 'components/metrics/QueryParametersTable';
import useFetch from 'hooks/useFetch';
import usePageQuery from 'hooks/usePageQuery';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import styles from './WebsiteDetails.module.css';
import EventDataButton from 'components/common/EventDataButton';

const messages = defineMessages({
  pages: { id: 'metrics.pages', defaultMessage: 'Pages' },
  referrers: { id: 'metrics.referrers', defaultMessage: 'Referrers' },
  screens: { id: 'metrics.screens', defaultMessage: 'Screens' },
  browsers: { id: 'metrics.browsers', defaultMessage: 'Browsers' },
  os: { id: 'metrics.operating-systems', defaultMessage: 'Operating system' },
  devices: { id: 'metrics.devices', defaultMessage: 'Devices' },
  countries: { id: 'metrics.countries', defaultMessage: 'Countries' },
  languages: { id: 'metrics.languages', defaultMessage: 'Languages' },
  events: { id: 'metrics.events', defaultMessage: 'Events' },
  query: { id: 'metrics.query-parameters', defaultMessage: 'Query parameters' },
});

const views = {
  url: PagesTable,
  referrer: ReferrersTable,
  browser: BrowsersTable,
  os: OSTable,
  device: DevicesTable,
  screen: ScreenTable,
  country: CountriesTable,
  language: LanguagesTable,
  event: EventsTable,
  query: QueryParametersTable,
};

export default function WebsiteDetails({ websiteId }) {
  const { data } = useFetch(`/websites/${websiteId}`);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [eventsData, setEventsData] = useState();
  const {
    resolve,
    query: { view },
  } = usePageQuery();
  const { formatMessage } = useIntl();

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
      label: formatMessage(messages.pages),
      value: resolve({ view: 'url' }),
    },
    {
      label: formatMessage(messages.referrers),
      value: resolve({ view: 'referrer' }),
    },
    {
      label: formatMessage(messages.browsers),
      value: resolve({ view: 'browser' }),
    },
    {
      label: formatMessage(messages.os),
      value: resolve({ view: 'os' }),
    },
    {
      label: formatMessage(messages.devices),
      value: resolve({ view: 'device' }),
    },
    {
      label: formatMessage(messages.countries),
      value: resolve({ view: 'country' }),
    },
    {
      label: formatMessage(messages.languages),
      value: resolve({ view: 'language' }),
    },
    {
      label: formatMessage(messages.screens),
      value: resolve({ view: 'screen' }),
    },
    {
      label: formatMessage(messages.events),
      value: resolve({ view: 'event' }),
    },
    {
      label: formatMessage(messages.query),
      value: resolve({ view: 'query' }),
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
              <EventDataButton websiteId={websiteId} />
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
