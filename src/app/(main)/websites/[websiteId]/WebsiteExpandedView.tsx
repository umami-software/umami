import { Grid, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';
import { SideMenu } from '@/components/common/SideMenu';
import {
  LogOut,
  LogIn,
  Search,
  Type,
  SquareSlash,
  Share2,
  Megaphone,
  Earth,
  Globe,
  Landmark,
  MapPin,
  AppWindow,
  Laptop,
  Languages,
  Monitor,
  Cpu,
  LightningSvg,
  Network,
  Tag,
} from '@/components/icons';

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
      label: formatMessage(labels.pages),
      items: [
        {
          id: 'path',
          label: formatMessage(labels.path),
          path: updateParams({ view: 'path' }),
          icon: <SquareSlash />,
        },
        {
          id: 'entry',
          label: formatMessage(labels.entry),
          path: updateParams({ view: 'entry' }),
          icon: <LogIn />,
        },
        {
          id: 'exit',
          label: formatMessage(labels.exit),
          path: updateParams({ view: 'exit' }),
          icon: <LogOut />,
        },
        {
          id: 'title',
          label: formatMessage(labels.title),
          path: updateParams({ view: 'title' }),
          icon: <Type />,
        },
        {
          id: 'query',
          label: formatMessage(labels.query),
          path: updateParams({ view: 'query' }),
          icon: <Search />,
        },
      ],
    },
    {
      label: formatMessage(labels.sources),
      items: [
        {
          id: 'referrer',
          label: formatMessage(labels.referrer),
          path: updateParams({ view: 'referrer' }),
          icon: <Share2 />,
        },
        {
          id: 'channel',
          label: formatMessage(labels.channel),
          path: updateParams({ view: 'channel' }),
          icon: <Megaphone />,
        },
        {
          id: 'domain',
          label: formatMessage(labels.domain),
          path: updateParams({ view: 'domain' }),
          icon: <Globe />,
        },
      ],
    },
    {
      label: formatMessage(labels.location),
      items: [
        {
          id: 'country',
          label: formatMessage(labels.country),
          path: updateParams({ view: 'country' }),
          icon: <Earth />,
        },
        {
          id: 'region',
          label: formatMessage(labels.region),
          path: updateParams({ view: 'region' }),
          icon: <MapPin />,
        },
        {
          id: 'city',
          label: formatMessage(labels.city),
          path: updateParams({ view: 'city' }),
          icon: <Landmark />,
        },
      ],
    },
    {
      label: formatMessage(labels.environment),
      items: [
        {
          id: 'browser',
          label: formatMessage(labels.browser),
          path: updateParams({ view: 'browser' }),
          icon: <AppWindow />,
        },
        {
          id: 'os',
          label: formatMessage(labels.os),
          path: updateParams({ view: 'os' }),
          icon: <Cpu />,
        },
        {
          id: 'device',
          label: formatMessage(labels.device),
          path: updateParams({ view: 'device' }),
          icon: <Laptop />,
        },
        {
          id: 'language',
          label: formatMessage(labels.language),
          path: updateParams({ view: 'language' }),
          icon: <Languages />,
        },
        {
          id: 'screen',
          label: formatMessage(labels.screen),
          path: updateParams({ view: 'screen' }),
          icon: <Monitor />,
        },
      ],
    },
    {
      label: formatMessage(labels.other),
      items: [
        {
          id: 'event',
          label: formatMessage(labels.event),
          path: updateParams({ view: 'event' }),
          icon: <LightningSvg />,
        },
        {
          id: 'hostname',
          label: formatMessage(labels.hostname),
          path: updateParams({ view: 'hostname' }),
          icon: <Network />,
        },
        {
          id: 'tag',
          label: formatMessage(labels.tag),
          path: updateParams({ view: 'tag' }),
          icon: <Tag />,
        },
      ],
    },
  ];

  return (
    <Grid columns="auto 1fr" gap="6" height="100%" overflow="hidden">
      <Column gap="6" border="right" paddingRight="3" overflowY="auto">
        <SideMenu items={items} selectedKey={view} />
      </Column>
      <Column overflow="hidden">
        <MetricsExpandedTable
          title={formatMessage(labels[view])}
          type={view}
          websiteId={websiteId}
          onClose={onClose}
        />
      </Column>
    </Grid>
  );
}
