import { useState } from 'react';
import { Column, Loading } from 'react-basics';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import WebsiteChart from 'components/metrics/WebsiteChart';
import WorldMap from 'components/common/WorldMap';
import Page from 'components/layout/Page';
import GridRow from 'components/layout/GridRow';
import MenuLayout from 'components/layout/MenuLayout';
import Link from 'components/common/Link';
import PagesTable from 'components/metrics/PagesTable';
import ReferrersTable from 'components/metrics/ReferrersTable';
import BrowsersTable from 'components/metrics/BrowsersTable';
import OSTable from 'components/metrics/OSTable';
import DevicesTable from 'components/metrics/DevicesTable';
import CountriesTable from 'components/metrics/CountriesTable';
import LanguagesTable from 'components/metrics/LanguagesTable';
import ScreenTable from 'components/metrics/ScreenTable';
import QueryParametersTable from 'components/metrics/QueryParametersTable';
import usePageQuery from 'hooks/usePageQuery';
import useApi from 'hooks/useApi';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteDetails.module.css';

const messages = defineMessages({
  pages: { id: 'metrics.pages', defaultMessage: 'Pages' },
  referrers: { id: 'metrics.referrers', defaultMessage: 'Referrers' },
  screens: { id: 'metrics.screens', defaultMessage: 'Screens' },
  browsers: { id: 'metrics.browsers', defaultMessage: 'Browsers' },
  os: { id: 'metrics.operating-systems', defaultMessage: 'Operating system' },
  devices: { id: 'metrics.devices', defaultMessage: 'Devices' },
  countries: { id: 'metrics.countries', defaultMessage: 'Countries' },
  languages: { id: 'metrics.languages', defaultMessage: 'Languages' },
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
  query: QueryParametersTable,
};

export default function WebsiteDetails({ websiteId }) {
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['websites', websiteId], () =>
    get(`/websites/${websiteId}`),
  );
  const [chartLoaded, setChartLoaded] = useState(false);
  const [countryData, setCountryData] = useState();
  const {
    resolve,
    query: { view },
  } = usePageQuery();
  const { formatMessage } = useIntl();

  const BackButton = () => (
    <div key="back-button" className={classNames(styles.backButton, 'col-12')}>
      <Link key="back-button" href={resolve({ view: undefined })} icon={<Arrow />} sizes="small">
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

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  return (
    <Page>
      <WebsiteChart
        websiteId={websiteId}
        title={data.name}
        domain={data.domain}
        onDataLoad={handleDataLoad}
        showLink={false}
        stickyHeader
      />
      {!chartLoaded && <Loading variant="dots" />}
      {chartLoaded && !view && (
        <>
          <GridRow>
            <Column variant="two" className={styles.column}>
              <PagesTable {...tableProps} />
            </Column>
            <Column variant="two" className={styles.column}>
              <ReferrersTable {...tableProps} />
            </Column>
          </GridRow>
          <GridRow>
            <Column variant="three" className={styles.column}>
              <BrowsersTable {...tableProps} />
            </Column>
            <Column variant="three" className={styles.column}>
              <OSTable {...tableProps} />
            </Column>
            <Column variant="three" className={styles.column}>
              <DevicesTable {...tableProps} />
            </Column>
          </GridRow>
          <GridRow>
            <Column xs={12} sm={12} md={12} defaultSize={8}>
              <WorldMap data={countryData} />
            </Column>
            <Column xs={12} sm={12} md={12} defaultSize={4}>
              <CountriesTable {...tableProps} onDataLoad={setCountryData} />
            </Column>
          </GridRow>
        </>
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
