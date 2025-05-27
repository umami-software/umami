import { Icon, Text, Grid, Column } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { SideMenu } from '@/components/common/SideMenu';
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
import { Panel } from '@/components/common/Panel';
import { Arrow } from '@/components/icons';

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
      id: 'url',
      label: formatMessage(labels.pages),
      url: renderUrl({ view: 'url' }),
    },
    {
      id: 'referrer',
      label: formatMessage(labels.referrers),
      url: renderUrl({ view: 'referrer' }),
    },
    {
      id: 'channel',
      label: formatMessage(labels.channels),
      url: renderUrl({ view: 'channel' }),
    },
    {
      id: 'browser',
      label: formatMessage(labels.browsers),
      url: renderUrl({ view: 'browser' }),
    },
    {
      id: 'os',
      label: formatMessage(labels.os),
      url: renderUrl({ view: 'os' }),
    },
    {
      id: 'device',
      label: formatMessage(labels.devices),
      url: renderUrl({ view: 'device' }),
    },
    {
      id: 'country',
      label: formatMessage(labels.countries),
      url: renderUrl({ view: 'country' }),
    },
    {
      id: 'region',
      label: formatMessage(labels.regions),
      url: renderUrl({ view: 'region' }),
    },
    {
      id: 'city',
      label: formatMessage(labels.cities),
      url: renderUrl({ view: 'city' }),
    },
    {
      id: 'language',
      label: formatMessage(labels.languages),
      url: renderUrl({ view: 'language' }),
    },
    {
      id: 'screen',
      label: formatMessage(labels.screens),
      url: renderUrl({ view: 'screen' }),
    },
    {
      id: 'event',
      label: formatMessage(labels.events),
      url: renderUrl({ view: 'event' }),
    },
    {
      id: 'query',
      label: formatMessage(labels.queryParameters),
      url: renderUrl({ view: 'query' }),
    },
    {
      id: 'host',
      label: formatMessage(labels.hosts),
      url: renderUrl({ view: 'host' }),
    },
    {
      id: 'tag',
      label: formatMessage(labels.tags),
      url: renderUrl({ view: 'tag' }),
    },
  ];

  const DetailsComponent = views[view] || (() => null);

  return (
    <Panel>
      <Grid columns="auto 1fr" gap="6">
        <Column gap="6" width="200px" border="right" paddingRight="3">
          <LinkButton href={renderUrl({ view: undefined })} variant="quiet" scroll={false}>
            <Icon rotate={180}>
              <Arrow />
            </Icon>
            <Text>{formatMessage(labels.back)}</Text>
          </LinkButton>
          <SideMenu items={items} selectedKey={view} />
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
    </Panel>
  );
}
