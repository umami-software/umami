import { Row, NavMenu, NavMenuItem, Icon, Text } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Funnel, Sheet, Magnet, Money, Network, Path, Tag, Target } from '@/components/icons';
import Link from 'next/link';

export function ReportsNav({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();

  const links = [
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
    {
      id: 'breakdown',
      label: formatMessage(labels.breakdown),
      icon: <Sheet />,
      path: '/breakdown',
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

  const selected = links.find(({ path }) => path && pathname.endsWith(path))?.id || 'goals';

  return (
    <NavMenu highlightColor="3">
      {links.map(({ id, label, icon, path }) => {
        const isSelected = selected === id;

        return (
          <Link
            key={id}
            href={renderUrl(
              `/websites/${websiteId}/reports${path}`,
              path === '/retention' ? { date: undefined } : null,
            )}
          >
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
