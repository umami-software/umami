import { Icon, Icons, Text, Grid, Column } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { SideBar } from '@/components/layout/SideBar';
import { BrowsersTable } from '@/components/metrics/BrowsersTable';
import { CitiesTable } from '@/components/metrics/CitiesTable';
import { CountriesTable } from '@/components/metrics/CountriesTable';
import { DevicesTable } from '@/components/metrics/DevicesTable';
import { EventsTable } from '@/components/metrics/EventsTable';
import { HostsTable } from '@/components/metrics/HostsTable';
import { LanguagesTable } from '@/components/metrics/LanguagesTable';
import { OSTable } from '@/components/metrics/OSTable';
import { PagesTable } from '@/components/metrics/PagesTable';
import { QueryParametersTable } from '@/components/metrics/QueryParametersTable';
import { ReferrersTable } from '@/components/metrics/ReferrersTable';
import { RegionsTable } from '@/components/metrics/RegionsTable';
import { ScreenTable } from '@/components/metrics/ScreenTable';
import { TagsTable } from '@/components/metrics/TagsTable';
import { ChannelsTable } from '@/components/metrics/ChannelsTable';

const views = {
  url: PagesTable,
  entry: PagesTable,
  exit: PagesTable,
  title: PagesTable,
  referrer: ReferrersTable,
  grouped: ReferrersTable,
  host: HostsTable,
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
  domainName,
}: {
  websiteId: string;
  domainName?: string;
}) {
  const { formatMessage, labels } = useMessages();
  const {
    renderUrl,
    query: { view },
  } = useNavigation();

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
      key: 'channel',
      label: formatMessage(labels.channels),
      url: renderUrl({ view: 'channel' }),
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

  const DetailsComponent = views[view] || (() => null);

  return (
    <Grid columns="auto 1fr" gap="6" marginTop="6">
      <Column gap="6" width="200px">
        <LinkButton href={renderUrl({ view: undefined })} variant="quiet" scroll={false}>
          <Icon rotate={180}>
            <Icons.Arrow />
          </Icon>
          <Text>{formatMessage(labels.back)}</Text>
        </LinkButton>
        <SideBar items={items} selectedKey={view} />
      </Column>
      <Column>
        <DetailsComponent
          websiteId={websiteId}
          domainName={domainName}
          animate={false}
          virtualize={true}
          itemCount={25}
          allowFilter={true}
          allowSearch={true}
        />
      </Column>
    </Grid>
  );
}
