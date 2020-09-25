import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import WebsiteChart from 'components/metrics/WebsiteChart';
import WorldMap from 'components/common/WorldMap';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import Button from 'components/common/Button';
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
import Loading from 'components/common/Loading';

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
  const router = useRouter();
  const { data } = useFetch(`/api/website/${websiteId}`, { token });
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const [eventsData, setEventsData] = useState();
  const {
    query: { id, view },
    basePath,
    asPath,
  } = router;

  const path = `${basePath}/${asPath.split('/')[1]}/${id.join('/')}`;

  const BackButton = () => (
    <Button
      key="back-button"
      className={styles.backButton}
      icon={<Arrow />}
      size="xsmall"
      onClick={() => router.push(path)}
    >
      <div>
        <FormattedMessage id="button.back" defaultMessage="Back" />
      </div>
    </Button>
  );

  const menuOptions = [
    {
      render: BackButton,
    },
    {
      label: <FormattedMessage id="metrics.pages" defaultMessage="Pages" />,
      value: `${path}?view=url`,
    },
    {
      label: <FormattedMessage id="metrics.referrers" defaultMessage="Referrers" />,
      value: `${path}?view=referrer`,
    },
    {
      label: <FormattedMessage id="metrics.browsers" defaultMessage="Browsers" />,
      value: `${path}?view=browser`,
    },
    {
      label: <FormattedMessage id="metrics.operating-systems" defaultMessage="Operating system" />,
      value: `${path}?view=os`,
    },
    {
      label: <FormattedMessage id="metrics.devices" defaultMessage="Devices" />,
      value: `${path}?view=device`,
    },
    {
      label: <FormattedMessage id="metrics.countries" defaultMessage="Countries" />,
      value: `${path}?view=country`,
    },
    {
      label: <FormattedMessage id="metrics.events" defaultMessage="Events" />,
      value: `${path}?view=event`,
    },
  ];

  const tableProps = {
    websiteId,
    token,
    websiteDomain: data?.domain,
    limit: 10,
    onExpand: handleExpand,
  };

  const DetailsComponent = views[view];

  function handleDataLoad() {
    if (!chartLoaded) {
      setTimeout(() => setChartLoaded(true), 300);
    }
  }

  function handleExpand(value) {
    router.push(`${path}?view=${value}`);
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
          <DetailsComponent {...tableProps} limit={false} />
        </MenuLayout>
      )}
    </Page>
  );
}
