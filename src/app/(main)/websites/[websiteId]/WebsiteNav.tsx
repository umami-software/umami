import { Icon, Text, Row, NavMenu, NavMenuItem } from '@umami/react-zen';
import {
  Eye,
  Lightning,
  User,
  Clock,
  Lightbulb,
  Target,
  Funnel,
  Path,
  Magnet,
  Tag,
  Money,
  Network,
} from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import Link from 'next/link';

export function WebsiteNav({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderTeamUrl } = useNavigation();

  const links = [
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
    {
      id: 'insights',
      label: formatMessage(labels.insights),
      icon: <Lightbulb />,
      path: '/insights',
    },
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
      label: formatMessage(labels.journey),
      icon: <Path />,
      path: '/journeys',
    },
    {
      id: 'retention',
      label: formatMessage(labels.retention),
      icon: <Magnet />,
      path: '/retention',
    },
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
  ];

  const selected = links.find(({ path }) => path && pathname.endsWith(path))?.id || 'overview';

  return (
    <NavMenu highlightColor="3">
      {links.map(({ id, label, icon, path }) => {
        const isSelected = selected === id;

        return (
          <Link key={id} href={renderTeamUrl(`/websites/${websiteId}${path}`)}>
            <NavMenuItem isSelected={isSelected}>
              <Row alignItems="center" gap>
                <Icon>{icon}</Icon>
                <Text>{label}</Text>
              </Row>
            </NavMenuItem>
          </Link>
        );
      })}
    </NavMenu>
  );
}
