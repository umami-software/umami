import { Icon, Text, Row, NavMenu, NavMenuItem, NavMenuGroup, Column } from '@umami/react-zen';
import {
  Eye,
  Lightning,
  User,
  Clock,
  Sheet,
  Target,
  Funnel,
  Path,
  Magnet,
  Tag,
  Money,
  Network,
  UserPlus,
  ChartPie,
} from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import Link from 'next/link';

export function WebsiteNav({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();

  const links = [
    {
      label: formatMessage(labels.traffic),
      items: [
        {
          id: 'overview',
          label: formatMessage(labels.overview),
          icon: <Eye />,
          path: '',
        },
        {
          id: 'events',
          label: formatMessage(labels.events),
          icon: <Lightning />,
          path: '/events',
        },
        {
          id: 'sessions',
          label: formatMessage(labels.sessions),
          icon: <User />,
          path: '/sessions',
        },
        {
          id: 'realtime',
          label: formatMessage(labels.realtime),
          icon: <Clock />,
          path: '/realtime',
        },
      ],
    },
    {
      label: formatMessage(labels.behavior),
      items: [
        {
          id: 'goals',
          label: formatMessage(labels.goals),
          icon: <Target />,
          path: '/goals',
        },
        {
          id: 'funnel',
          label: formatMessage(labels.funnels),
          icon: <Funnel />,
          path: '/funnels',
        },
        {
          id: 'journeys',
          label: formatMessage(labels.journeys),
          icon: <Path />,
          path: '/journeys',
        },
        {
          id: 'retention',
          label: formatMessage(labels.retention),
          icon: <Magnet />,
          path: '/retention',
        },
      ],
    },
    {
      label: formatMessage(labels.segments),
      items: [
        {
          id: 'breakdown',
          label: formatMessage(labels.breakdown),
          icon: <Sheet />,
          path: '/breakdown',
        },
        {
          id: 'segments',
          label: formatMessage(labels.segments),
          icon: <ChartPie />,
          path: '/segments',
        },
        {
          id: 'cohorts',
          label: formatMessage(labels.cohorts),
          icon: <UserPlus />,
          path: '/cohorts',
        },
      ],
    },
    {
      label: formatMessage(labels.growth),
      items: [
        {
          id: 'utm',
          label: formatMessage(labels.utm),
          icon: <Tag />,
          path: '/utm',
        },
        {
          id: 'revenue',
          label: formatMessage(labels.revenue),
          icon: <Money />,
          path: '/revenue',
        },
        {
          id: 'attribution',
          label: formatMessage(labels.attribution),
          icon: <Network />,
          path: '/attribution',
        },
      ],
    },
  ];

  const selected =
    links.flatMap(e => e.items).find(({ path }) => path && pathname.endsWith(path))?.id ||
    'overview';

  return (
    <Column gap padding width="240px" border="left">
      <NavMenu highlightColor="2">
        {links.map(({ label, items }) => {
          return (
            <NavMenuGroup title={label} key={label} gap="1">
              {items.map(({ id, label, icon, path }) => {
                const isSelected = selected === id;

                return (
                  <Link key={id} href={renderUrl(`/websites/${websiteId}${path}`)}>
                    <NavMenuItem isSelected={isSelected}>
                      <Row alignItems="center" gap>
                        <Icon>{icon}</Icon>
                        <Text>{label}</Text>
                      </Row>
                    </NavMenuItem>
                  </Link>
                );
              })}
            </NavMenuGroup>
          );
        })}
      </NavMenu>
    </Column>
  );
}
