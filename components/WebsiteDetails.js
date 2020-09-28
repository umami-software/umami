import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import WebsiteChart from 'components/metrics/WebsiteChart';
import WorldMap from 'components/common/WorldMap';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import Link from 'components/common/Link';
import Loading from 'components/common/Loading';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteDetails.module.css';
import PagesTable from './metrics/PagesTable';
import ReferrersTable from './metrics/ReferrersTable';
import BrowsersTable from './metrics/BrowsersTable';
import OSTable from './metrics/OSTable';
import DevicesTable from './metrics/DevicesTable';
import CountriesTable from './metrics/CountriesTable';
import EventsTable from './metrics/EventsTable';
import EventsChart from './metrics/EventsChart';
import useFetch from 'hooks/useFetch';
import usePageQuery from 'hooks/usePageQuery';

const views = {
  url: PagesTable,
  referrer: ReferrersTable,
  browser: BrowsersTable,
  os: OSTable,
  device: DevicesTable,
  country: CountriesTable,
  event: EventsTable,
};

export default function WebsiteDetails({ websiteId, token }) {
  const { data } = useFetch(`/api/website/${websiteId}`, { token });
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [eventsData, setEventsData] = useState();
  const {
    resolve,
    router,
    query: { view },
  } = usePageQuery();

  const BackButton = () => (
    <Link
      key="back-button"
      className={styles.backButton}
      href={router.pathname}
      as={resolve({ view: undefined })}
      icon={<Arrow />}
      size="small"
    >
      <FormattedMessage id="button.back" defaultMessage="Back" />
    </Link>
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
      label: <FormattedMessage id="metrics.events" defaultMessage="Events" />,
      value: resolve({ view: 'event' }),
    },
  ];

  const tableProps = {
    websiteId,
    token,
    websiteDomain: data?.domain,
    limit: 10,
  };

  const DetailsComponent = views[view];

  function handleDataLoad() {
    if (!chartLoaded) {
      setTimeout(() => setChartLoaded(true), 300);
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
            token={token}
            title={data.name}
            onDataLoad={handleDataLoad}
            showLink={false}
            stickyHeader
          />
        </div>
      </div>
      {!chartLoaded && <Loading />}
      {chartLoaded && !view && (
        <>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-md-12 col-lg-6">
              <PagesTable {...tableProps} />
            </div>
            <div className="col-md-12 col-lg-6">
              <ReferrersTable {...tableProps} />
            </div>
          </div>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-md-12 col-lg-4">
              <BrowsersTable {...tableProps} />
            </div>
            <div className="col-md-12 col-lg-4">
              <OSTable {...tableProps} />
            </div>
            <div className="col-md-12 col-lg-4">
              <DevicesTable {...tableProps} />
            </div>
          </div>
          <div className={classNames(styles.row, 'row')}>
            <div className="col-12 col-md-12 col-lg-8">
              <WorldMap data={countryData} />
            </div>
            <div className="col-12 col-md-12 col-lg-4">
              <CountriesTable {...tableProps} onDataLoad={setCountryData} />
            </div>
          </div>
          <div
            className={classNames(styles.row, 'row', { [styles.hidden]: !eventsData?.length > 0 })}
          >
            <div className="col-12 col-md-12 col-lg-4">
              <EventsTable {...tableProps} onDataLoad={setEventsData} />
            </div>
            <div className="col-12 col-md-12 col-lg-8 pt-5 pb-5">
              <EventsChart websiteId={websiteId} token={token} />
            </div>
          </div>
        </>
      )}
      {view && (
        <MenuLayout
          className={styles.view}
          menuClassName={styles.menu}
          contentClassName={styles.content}
          menu={menuOptions}
        >
          <DetailsComponent {...tableProps} limit={false} showFilters={true} />
        </MenuLayout>
      )}
    </Page>
  );
}
