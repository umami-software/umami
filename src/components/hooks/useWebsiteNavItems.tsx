import {
  AlignEndHorizontal,
  Bug,
  ChartPie,
  Clock,
  Eye,
  Flame,
  Sheet,
  ShoppingCart,
  Tag,
  User,
  UserPlus,
  Video,
} from '@/components/icons';
import { Funnel, Gauge, Lightning, Magnet, Money, Network, Path, Target } from '@/components/svg';
import { useFlag } from './useFlag';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';

export function useWebsiteNavItems(websiteId: string) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();
  const commerceEnabled = useFlag('commerce');
  const resetParams = {
    search: undefined,
    page: undefined,
  };

  const renderPath = (path: string) =>
    renderUrl(`/websites/${websiteId}${path}`, {
      ...resetParams,
      event: undefined,
      compare: undefined,
      view: undefined,
      unit: undefined,
      excludeBounce: undefined,
      // Commerce report state
      tab: undefined,
      market: undefined,
      product: undefined,
      order: undefined,
      group: undefined,
      sort: undefined,
      model: undefined,
    });

  const items = [
    {
      label: t(labels.traffic),
      items: [
        {
          id: 'overview',
          label: t(labels.overview),
          icon: <Eye />,
          path: renderPath(''),
        },
        {
          id: 'events',
          label: t(labels.events),
          icon: <Lightning />,
          path: renderPath('/events'),
        },
        {
          id: 'sessions',
          label: t(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
        },
        {
          id: 'realtime',
          label: t(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
        {
          id: 'compare',
          label: t(labels.compare),
          icon: <AlignEndHorizontal />,
          path: renderPath('/compare'),
        },
        {
          id: 'breakdown',
          label: t(labels.breakdown),
          icon: <Sheet />,
          path: renderPath('/breakdown'),
        },
      ],
    },
    {
      label: t(labels.behavior),
      items: [
        {
          id: 'goals',
          label: t(labels.goals),
          icon: <Target />,
          path: renderPath('/goals'),
        },
        {
          id: 'funnel',
          label: t(labels.funnels),
          icon: <Funnel />,
          path: renderPath('/funnels'),
        },
        {
          id: 'journeys',
          label: t(labels.journeys),
          icon: <Path />,
          path: renderPath('/journeys'),
        },
        {
          id: 'retention',
          label: t(labels.retention),
          icon: <Magnet />,
          path: renderPath('/retention'),
        },
        {
          id: 'replays',
          label: t(labels.replays),
          icon: <Video />,
          path: renderPath('/replays'),
        },
        {
          id: 'heatmaps',
          label: t(labels.heatmaps),
          icon: <Flame />,
          path: renderPath('/heatmaps'),
        },
      ],
    },
    {
      label: t(labels.audience),
      items: [
        {
          id: 'segments',
          label: t(labels.segments),
          icon: <ChartPie />,
          path: renderPath('/segments'),
        },
        {
          id: 'cohorts',
          label: t(labels.cohorts),
          icon: <UserPlus />,
          path: renderPath('/cohorts'),
        },
      ],
    },
    {
      label: t(labels.growth),
      items: [
        {
          id: 'utm',
          label: t(labels.utm),
          icon: <Tag />,
          path: renderPath('/utm'),
        },
        {
          id: 'revenue',
          label: t(labels.revenue),
          icon: <Money />,
          path: renderPath('/revenue'),
        },
        ...(commerceEnabled
          ? [
              {
                id: 'commerce',
                label: t(labels.commerce),
                icon: <ShoppingCart />,
                path: renderPath('/commerce'),
              },
            ]
          : []),
        {
          id: 'attribution',
          label: t(labels.attribution),
          icon: <Network />,
          path: renderPath('/attribution'),
        },
      ],
    },
    {
      label: t(labels.monitoring),
      items: [
        {
          id: 'performance',
          label: t(labels.performance),
          icon: <Gauge />,
          path: renderPath('/performance'),
        },
        {
          id: 'errors',
          label: t('errorTracking.title'),
          icon: <Bug />,
          path: renderPath('/errors'),
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(
      ({ path }) =>
        path &&
        (pathname.endsWith(path.split('?')[0]) ||
          (path.split('?')[0].endsWith('/errors') && pathname.includes('/errors/'))),
    )?.id;

  return { items, selectedKey, renderPath };
}
