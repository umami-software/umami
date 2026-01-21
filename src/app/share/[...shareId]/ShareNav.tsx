'use client';
import { Column } from '@umami/react-zen';
import { SideMenu } from '@/components/common/SideMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { AlignEndHorizontal, Clock, Eye, Sheet, Tag, User } from '@/components/icons';
import { Funnel, Lightning, Magnet, Money, Network, Path, Target } from '@/components/svg';

export function ShareNav({
  shareId,
  parameters,
  onItemClick,
}: {
  shareId: string;
  parameters: Record<string, boolean>;
  onItemClick?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();

  const renderPath = (path: string) => `/share/${shareId}${path}`;

  const allItems = [
    {
      section: 'traffic',
      label: formatMessage(labels.traffic),
      items: [
        {
          id: 'overview',
          label: formatMessage(labels.overview),
          icon: <Eye />,
          path: renderPath(''),
        },
        {
          id: 'events',
          label: formatMessage(labels.events),
          icon: <Lightning />,
          path: renderPath('/events'),
        },
        {
          id: 'sessions',
          label: formatMessage(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
        },
        {
          id: 'realtime',
          label: formatMessage(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
        {
          id: 'compare',
          label: formatMessage(labels.compare),
          icon: <AlignEndHorizontal />,
          path: renderPath('/compare'),
        },
        {
          id: 'breakdown',
          label: formatMessage(labels.breakdown),
          icon: <Sheet />,
          path: renderPath('/breakdown'),
        },
      ],
    },
    {
      section: 'behavior',
      label: formatMessage(labels.behavior),
      items: [
        {
          id: 'goals',
          label: formatMessage(labels.goals),
          icon: <Target />,
          path: renderPath('/goals'),
        },
        {
          id: 'funnels',
          label: formatMessage(labels.funnels),
          icon: <Funnel />,
          path: renderPath('/funnels'),
        },
        {
          id: 'journeys',
          label: formatMessage(labels.journeys),
          icon: <Path />,
          path: renderPath('/journeys'),
        },
        {
          id: 'retention',
          label: formatMessage(labels.retention),
          icon: <Magnet />,
          path: renderPath('/retention'),
        },
      ],
    },
    {
      section: 'growth',
      label: formatMessage(labels.growth),
      items: [
        {
          id: 'utm',
          label: formatMessage(labels.utm),
          icon: <Tag />,
          path: renderPath('/utm'),
        },
        {
          id: 'revenue',
          label: formatMessage(labels.revenue),
          icon: <Money />,
          path: renderPath('/revenue'),
        },
        {
          id: 'attribution',
          label: formatMessage(labels.attribution),
          icon: <Network />,
          path: renderPath('/attribution'),
        },
      ],
    },
  ];

  // Filter items based on parameters
  const items = allItems
    .map(section => ({
      label: section.label,
      items: section.items.filter(item => parameters[item.id] !== false),
    }))
    .filter(section => section.items.length > 0);

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id;

  return (
    <Column padding="3" position="sticky" top="0" gap>
      <SideMenu
        items={items}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </Column>
  );
}
