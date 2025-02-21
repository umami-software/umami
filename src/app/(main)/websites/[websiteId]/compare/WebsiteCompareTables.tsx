import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { Grid, GridRow } from '@/components/layout/Grid';
import SideNav from '@/components/layout/SideNav';
import BrowsersTable from '@/components/metrics/BrowsersTable';
import ChangeLabel from '@/components/metrics/ChangeLabel';
import CitiesTable from '@/components/metrics/CitiesTable';
import CountriesTable from '@/components/metrics/CountriesTable';
import DevicesTable from '@/components/metrics/DevicesTable';
import EventsTable from '@/components/metrics/EventsTable';
import LanguagesTable from '@/components/metrics/LanguagesTable';
import MetricsTable from '@/components/metrics/MetricsTable';
import OSTable from '@/components/metrics/OSTable';
import PagesTable from '@/components/metrics/PagesTable';
import QueryParametersTable from '@/components/metrics/QueryParametersTable';
import ReferrersTable from '@/components/metrics/ReferrersTable';
import RegionsTable from '@/components/metrics/RegionsTable';
import ScreenTable from '@/components/metrics/ScreenTable';
import TagsTable from '@/components/metrics/TagsTable';
import { getCompareDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { useState } from 'react';
import useStore from '@/store/websites';
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
  tag: TagsTable,
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
    {
      key: 'host',
      label: formatMessage(labels.hosts),
      url: renderUrl({ view: 'host' }),
    },
    {
      key: 'tag',
      label: formatMessage(labels.tags),
      url: renderUrl({ view: 'tag' }),
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
