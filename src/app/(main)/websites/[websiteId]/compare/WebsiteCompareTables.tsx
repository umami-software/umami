import { useState } from 'react';
import SideNav from 'components/layout/SideNav';
import { useDateRange, useMessages, useNavigation } from 'components/hooks';
import PagesTable from 'components/metrics/PagesTable';
import ReferrersTable from 'components/metrics/ReferrersTable';
import BrowsersTable from 'components/metrics/BrowsersTable';
import OSTable from 'components/metrics/OSTable';
import DevicesTable from 'components/metrics/DevicesTable';
import ScreenTable from 'components/metrics/ScreenTable';
import CountriesTable from 'components/metrics/CountriesTable';
import RegionsTable from 'components/metrics/RegionsTable';
import CitiesTable from 'components/metrics/CitiesTable';
import LanguagesTable from 'components/metrics/LanguagesTable';
import EventsTable from 'components/metrics/EventsTable';
import QueryParametersTable from 'components/metrics/QueryParametersTable';
import { Grid, GridRow } from 'components/layout/Grid';
import MetricsTable from 'components/metrics/MetricsTable';
import useStore from 'store/websites';
import { getCompareDate } from 'lib/date';
import { formatNumber } from 'lib/format';
import ChangeLabel from 'components/metrics/ChangeLabel';
import styles from './WebsiteCompareTables.module.css';

const views = {
  url: PagesTable,
  title: PagesTable,
  referrer: ReferrersTable,
  browser: BrowsersTable,
  os: OSTable,
  device: DevicesTable,
  screen: ScreenTable,
  country: CountriesTable,
  region: RegionsTable,
  city: CitiesTable,
  language: LanguagesTable,
  event: EventsTable,
  query: QueryParametersTable,
};

export function WebsiteCompareTables({ websiteId }: { websiteId: string }) {
  const [data, setData] = useState([]);
  const { dateRange } = useDateRange(websiteId);
  const dateCompare = useStore(state => state[websiteId]?.dateCompare);
  const { formatMessage, labels } = useMessages();
  const {
    renderUrl,
    query: { view },
  } = useNavigation();
  const Component: typeof MetricsTable = views[view || 'url'] || (() => null);

  const items = [
    {
      key: 'url',
      label: formatMessage(labels.pages),
      url: renderUrl({ view: 'url' }),
    },
    {
      key: 'referrer',
      label: formatMessage(labels.referrers),
      url: renderUrl({ view: 'referrer' }),
    },
    {
      key: 'browser',
      label: formatMessage(labels.browsers),
      url: renderUrl({ view: 'browser' }),
    },
    {
      key: 'os',
      label: formatMessage(labels.os),
      url: renderUrl({ view: 'os' }),
    },
    {
      key: 'device',
      label: formatMessage(labels.devices),
      url: renderUrl({ view: 'device' }),
    },
    {
      key: 'country',
      label: formatMessage(labels.countries),
      url: renderUrl({ view: 'country' }),
    },
    {
      key: 'region',
      label: formatMessage(labels.regions),
      url: renderUrl({ view: 'region' }),
    },
    {
      key: 'city',
      label: formatMessage(labels.cities),
      url: renderUrl({ view: 'city' }),
    },
    {
      key: 'language',
      label: formatMessage(labels.languages),
      url: renderUrl({ view: 'language' }),
    },
    {
      key: 'screen',
      label: formatMessage(labels.screens),
      url: renderUrl({ view: 'screen' }),
    },
    {
      key: 'event',
      label: formatMessage(labels.events),
      url: renderUrl({ view: 'event' }),
    },
    {
      key: 'query',
      label: formatMessage(labels.queryParameters),
      url: renderUrl({ view: 'query' }),
    },
  ];

  const renderChange = ({ x, y }) => {
    const prev = data.find(d => d.x === x)?.y;
    const value = y - prev;
    const change = Math.abs(((y - prev) / prev) * 100);

    return !isNaN(change) && <ChangeLabel value={value}>{formatNumber(change)}%</ChangeLabel>;
  };

  const { startDate, endDate } = getCompareDate(
    dateCompare,
    dateRange.startDate,
    dateRange.endDate,
  );

  const params = {
    startAt: startDate.getTime(),
    endAt: endDate.getTime(),
  };

  return (
    <Grid className={styles.container}>
      <GridRow columns="compare">
        <SideNav className={styles.nav} items={items} selectedKey={view} shallow={true} />
        <div>
          <div className={styles.title}>{formatMessage(labels.previous)}</div>
          <Component
            websiteId={websiteId}
            limit={20}
            showMore={false}
            onDataLoad={setData}
            params={params}
          />
        </div>
        <div>
          <div className={styles.title}> {formatMessage(labels.current)}</div>
          <Component
            websiteId={websiteId}
            limit={20}
            showMore={false}
            renderChange={renderChange}
          />
        </div>
      </GridRow>
    </Grid>
  );
}

export default WebsiteCompareTables;
