import { Icon, Text, Row, NavMenu, NavMenuItem } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import Link from 'next/link';

export function WebsiteNav({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderTeamUrl } = useNavigation();

  const links = [
    {
      id: 'overview',
      label: formatMessage(labels.overview),
      icon: <Icons.Overview />,
      path: '',
    },
    {
      id: 'events',
      label: formatMessage(labels.events),
      icon: <Icons.Lightning />,
      path: '/events',
    },
    {
      id: 'sessions',
      label: formatMessage(labels.sessions),
      icon: <Icons.User />,
      path: '/sessions',
    },
    {
      id: 'realtime',
      label: formatMessage(labels.realtime),
      icon: <Icons.Clock />,
      path: '/realtime',
    },
    {
      id: 'insights',
      label: formatMessage(labels.insights),
      icon: <Icons.Lightbulb />,
      path: '/insights',
    },
    {
      id: 'goals',
      label: formatMessage(labels.goals),
      icon: <Icons.Target />,
      path: '/goals',
    },
    {
      id: 'funnel',
      label: formatMessage(labels.funnel),
      icon: <Icons.Funnel />,
      path: '/funnels',
    },
    {
      id: 'journeys',
      label: formatMessage(labels.journey),
      icon: <Icons.Path />,
      path: '/goals',
    },
    {
      id: 'retention',
      label: formatMessage(labels.retention),
      icon: <Icons.Magnet />,
      path: '/retention',
    },
    {
      id: 'utm',
      label: formatMessage(labels.utm),
      icon: <Icons.Tag />,
      path: '/utm',
    },
    {
      id: 'revenue',
      label: formatMessage(labels.revenue),
      icon: <Icons.Money />,
      path: '/revenue',
    },
    {
      id: 'attribution',
      label: formatMessage(labels.attribution),
      icon: <Icons.Network />,
      path: '/attribution',
    },
    {
      id: 'reports',
      label: formatMessage(labels.reports),
      icon: <Icons.Reports />,
      path: '/reports',
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
                <Icon style={{ fill: 'currentcolor' }}>{icon}</Icon>
                <Text>{label}</Text>
              </Row>
            </NavMenuItem>
          </Link>
        );
      })}
    </NavMenu>
  );
}
