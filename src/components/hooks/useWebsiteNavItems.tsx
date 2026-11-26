import type { ReactNode } from 'react';
import {
  AlignEndHorizontal,
  Bug,
  ChartPie,
  Clock,
  Eye,
  Flame,
  Megaphone,
  Search,
  Sheet,
  Tag,
  User,
  UserPlus,
  Video,
} from '@/components/icons';
import { Funnel, Gauge, Lightning, Magnet, Money, Network, Path, Target } from '@/components/svg';
import { useConfig } from './useConfig';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export function useWebsiteNavItems(websiteId: string) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();
  const config = useConfig();
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
    });

  const items: NavSection[] = [
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
          children: [
            {
              id: 'events-chart',
              label: t(labels.chart),
              path: renderPath('/events'),
            },
            {
              id: 'events-activity',
              label: t(labels.activity),
              path: renderPath('/events/activity'),
            },
            {
              id: 'events-properties',
              label: t(labels.properties),
              path: renderPath('/events/properties'),
            },
          ],
        },
        {
          id: 'sessions',
          label: t(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
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
        // Google Search Console is a Cloud integration.
        ...(config?.cloudMode
          ? [
              {
                id: 'search-console',
                label: t('searchConsole.searches'),
                icon: <Search />,
                path: renderPath('/search-console'),
              },
            ]
          : []),
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
        // Google Ads is a Cloud integration.
        ...(config?.cloudMode
          ? [
              {
                id: 'google-ads',
                label: t('ads.ads'),
                icon: <Megaphone />,
                path: renderPath('/google-ads'),
              },
            ]
          : []),
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
          id: 'realtime',
          label: t(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
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

  // Sub-items come before their parent so they win when they share its path.
  const selectedKey = items
    .flatMap(e => e.items)
    .flatMap((item: NavItem) => [...(item.children ?? []), item])
    .find(
      ({ path }) =>
        path &&
        (pathname.endsWith(path.split('?')[0]) ||
          (path.split('?')[0].endsWith('/errors') && pathname.includes('/errors/'))),
    )?.id;

  return { items, selectedKey, renderPath };
}
