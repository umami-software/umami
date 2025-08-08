import { Grid, Column, NavMenu, NavMenuItem } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { CitiesTable } from '@/components/metrics/CitiesTable';
import { CountriesTable } from '@/components/metrics/CountriesTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { EventsTable } from '@/components/metrics/EventsTable';
import { HostnamesTable } from '@/components/metrics/HostnamesTable';
import { LanguagesTable } from '@/components/metrics/LanguagesTable';
import { OSTable } from '@/components/metrics/OSTable';
import { PagesTable } from '@/components/metrics/PagesTable';
import { QueryParametersTable } from '@/components/metrics/QueryParametersTable';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { RegionsTable } from '@/components/metrics/RegionsTable';
import { ScreenTable } from '@/components/metrics/ScreenTable';
import { TagsTable } from '@/components/metrics/TagsTable';
import { ChannelsTable } from '@/components/metrics/ChannelsTable';
import Link from 'next/link';

const views = {
  path: PagesTable,
  entry: PagesTable,
  exit: PagesTable,
  title: PagesTable,
  referrer: ReferrersTable,
  grouped: ReferrersTable,
  hostname: HostnamesTable,
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
  channel: ChannelsTable,
};

export function WebsiteExpandedView({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const {
    updateParams,
    query: { view },
  } = useNavigation();

  const items = [
    {
      id: 'path',
      label: formatMessage(labels.pages),
      path: updateParams({ view: 'path' }),
    },
    {
      id: 'referrer',
      label: formatMessage(labels.referrers),
      path: updateParams({ view: 'referrer' }),
    },
    {
      id: 'channel',
      label: formatMessage(labels.channels),
      path: updateParams({ view: 'channel' }),
    },
    {
      id: 'browser',
      label: formatMessage(labels.browsers),
      path: updateParams({ view: 'browser' }),
    },
    {
      id: 'os',
      label: formatMessage(labels.os),
      path: updateParams({ view: 'os' }),
    },
    {
      id: 'device',
      label: formatMessage(labels.devices),
      path: updateParams({ view: 'device' }),
    },
    {
      id: 'country',
      label: formatMessage(labels.countries),
      path: updateParams({ view: 'country' }),
    },
    {
      id: 'region',
      label: formatMessage(labels.regions),
      path: updateParams({ view: 'region' }),
    },
    {
      id: 'city',
      label: formatMessage(labels.cities),
      path: updateParams({ view: 'city' }),
    },
    {
      id: 'language',
      label: formatMessage(labels.languages),
      path: updateParams({ view: 'language' }),
    },
    {
      id: 'screen',
      label: formatMessage(labels.screens),
      path: updateParams({ view: 'screen' }),
    },
    {
      id: 'event',
      label: formatMessage(labels.events),
      path: updateParams({ view: 'event' }),
    },
    {
      id: 'query',
      label: formatMessage(labels.queryParameters),
      path: updateParams({ view: 'query' }),
    },
    {
      id: 'hostname',
      label: formatMessage(labels.hostname),
      path: updateParams({ view: 'hostname' }),
    },
    {
      id: 'tag',
      label: formatMessage(labels.tags),
      path: updateParams({ view: 'tag' }),
    },
  ];

  const DetailsComponent = views[view] || (() => null);

  return (
    <Grid columns="auto 1fr" gap="6" height="100%">
      <Column gap="6" width="200px" border="right" paddingRight="3">
        <NavMenu position="sticky" top="0">
          {items.map(({ id, label, path }) => {
            return (
              <Link key={id} href={path}>
                <NavMenuItem isSelected={id === view}>{label}</NavMenuItem>
              </Link>
            );
          })}
        </NavMenu>
      </Column>
      <Column>
        <DetailsComponent
          websiteId={websiteId}
          animate={false}
          virtualize={true}
          itemCount={25}
          allowFilter={true}
          allowSearch={true}
          isExpanded={true}
          onClose={onClose}
        />
      </Column>
    </Grid>
  );
}
