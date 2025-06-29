import { Grid, Heading, Column, Row } from '@umami/react-zen';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { SideMenu } from '@/components/common/SideMenu';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { CitiesTable } from '@/components/metrics/CitiesTable';
import { CountriesTable } from '@/components/metrics/CountriesTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { EventsTable } from '@/components/metrics/EventsTable';
import { LanguagesTable } from '@/components/metrics/LanguagesTable';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { OSTable } from '@/components/metrics/OSTable';
import { PagesTable } from '@/components/metrics/PagesTable';
import { QueryParametersTable } from '@/components/metrics/QueryParametersTable';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { RegionsTable } from '@/components/metrics/RegionsTable';
import { ScreenTable } from '@/components/metrics/ScreenTable';
import { TagsTable } from '@/components/metrics/TagsTable';
import { getCompareDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { useState } from 'react';
import { useWebsites } from '@/store/websites';
import { Panel } from '@/components/common/Panel';
import { DateDisplay } from '@/components/common/DateDisplay';

const views = {
  path: PagesTable,
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
  const dateCompare = useWebsites(state => state[websiteId]?.dateCompare);
  const { formatMessage, labels } = useMessages();
  const {
    updateParams,
    query: { view },
  } = useNavigation();
  const Component: typeof MetricsTable = views[view || 'path'] || (() => null);

  const items = [
    {
      id: 'path',
      label: formatMessage(labels.pages),
      url: updateParams({ view: 'path' }),
    },
    {
      id: 'referrer',
      label: formatMessage(labels.referrers),
      url: updateParams({ view: 'referrer' }),
    },
    {
      id: 'browser',
      label: formatMessage(labels.browsers),
      url: updateParams({ view: 'browser' }),
    },
    {
      id: 'os',
      label: formatMessage(labels.os),
      url: updateParams({ view: 'os' }),
    },
    {
      id: 'device',
      label: formatMessage(labels.devices),
      url: updateParams({ view: 'device' }),
    },
    {
      id: 'country',
      label: formatMessage(labels.countries),
      url: updateParams({ view: 'country' }),
    },
    {
      id: 'region',
      label: formatMessage(labels.regions),
      url: updateParams({ view: 'region' }),
    },
    {
      id: 'city',
      label: formatMessage(labels.cities),
      url: updateParams({ view: 'city' }),
    },
    {
      id: 'language',
      label: formatMessage(labels.languages),
      url: updateParams({ view: 'language' }),
    },
    {
      id: 'screen',
      label: formatMessage(labels.screens),
      url: updateParams({ view: 'screen' }),
    },
    {
      id: 'event',
      label: formatMessage(labels.events),
      url: updateParams({ view: 'event' }),
    },
    {
      id: 'query',
      label: formatMessage(labels.queryParameters),
      url: updateParams({ view: 'query' }),
    },
    {
      id: 'hostname',
      label: formatMessage(labels.hostname),
      url: updateParams({ view: 'hostname' }),
    },
    {
      id: 'tag',
      label: formatMessage(labels.tags),
      url: updateParams({ view: 'tag' }),
    },
  ];

  const renderChange = ({ x, y }) => {
    const prev = data.find(d => d.x === x)?.y;
    const value = y - prev;
    const change = Math.abs(((y - prev) / prev) * 100);

    return (
      !isNaN(change) && (
        <Row alignItems="center" marginRight="3">
          <ChangeLabel value={value}>{formatNumber(change)}%</ChangeLabel>
        </Row>
      )
    );
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
    <Panel>
      <Grid columns={{ xs: '1fr', lg: '200px 1fr 1fr' }} gap="6">
        <SideMenu items={items} selectedKey={view} />
        <Column border="left" paddingLeft="6" gap="6">
          <Row alignItems="center" justifyContent="space-between">
            <Heading size="1">{formatMessage(labels.previous)}</Heading>
            <DateDisplay startDate={startDate} endDate={endDate} />
          </Row>
          <Component
            websiteId={websiteId}
            limit={20}
            showMore={false}
            onDataLoad={setData}
            params={params}
          />
        </Column>
        <Column border="left" paddingLeft="6" gap="6">
          <Row alignItems="center" justifyContent="space-between">
            <Heading size="1"> {formatMessage(labels.current)}</Heading>
            <DateDisplay startDate={dateRange.startDate} endDate={dateRange.endDate} />
          </Row>
          <Component
            websiteId={websiteId}
            limit={20}
            showMore={false}
            renderChange={renderChange}
          />
        </Column>
      </Grid>
    </Panel>
  );
}
