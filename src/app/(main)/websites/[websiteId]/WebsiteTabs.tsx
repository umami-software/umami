import { Column, Icon, Text, Row } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import Link from 'next/link';

export function WebsiteTabs({ websiteId }: { websiteId: string }) {
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
      path: '/funnels',
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

  const selected = links
    ? links.find(({ path }) => path && pathname.endsWith(path))?.id
    : 'overview';

  return (
    <Column gap="2" position="absolute" padding="4" style={{ top: 0, left: 0, bottom: 0 }}>
      {links.map(({ id, label, icon, path }) => {
        return (
          <Link key={id} href={renderTeamUrl(`/websites/${websiteId}/${path}`)}>
            <Row
              alignItems="center"
              padding
              gap
              hoverBackgroundColor="3"
              borderRadius
              width="160px"
            >
              <Icon fillColor="currentColor">{icon}</Icon>
              <Text weight={selected === id ? 'bold' : undefined}>{label}</Text>
            </Row>
          </Link>
        );
      })}
    </Column>
  );
}
