import { useMessages, useNavigation } from '@/components/hooks';
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
  Network,
  Tag,
} from '@/components/icons';
import { Lightning } from '@/components/svg';

export function WebsiteExpandedMenu({
  excludedIds = [],
  onItemClick,
}: {
  excludedIds?: string[];
  onItemClick?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const {
    updateParams,
    query: { view },
  } = useNavigation();

  const filterExcluded = (item: { id: string }) => !excludedIds.includes(item.id);

  const items = [
    {
      label: 'URL',
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
      ].filter(filterExcluded),
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
      ].filter(filterExcluded),
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
      ].filter(filterExcluded),
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
      ].filter(filterExcluded),
    },
    {
      label: formatMessage(labels.other),
      items: [
        {
          id: 'event',
          label: formatMessage(labels.event),
          path: updateParams({ view: 'event' }),
          icon: <Lightning />,
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
      ].filter(filterExcluded),
    },
  ];

  return <SideMenu items={items} selectedKey={view} onItemClick={onItemClick} />;
}
