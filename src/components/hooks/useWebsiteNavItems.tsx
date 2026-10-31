import {
  AlignEndHorizontal,
  Bug,
  ChartPie,
  Clock,
  Eye,
  Flame,
  Search,
  Sheet,
  Tag,
  User,
  UserPlus,
  Video,
} from '@/components/icons';
import { Funnel, Gauge, Lightning, Magnet, Money, Network, Path, Target } from '@/components/svg';
import { ROLES } from '@/lib/constants';
import { useLoginQuery } from './queries/useLoginQuery';
import { useTeamQuery } from './queries/useTeamQuery';
import { useWebsiteQuery } from './queries/useWebsiteQuery';
import { useConfig } from './useConfig';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';

// Nav items a team can limit its view-only members to, by the section the API checks.
const MEMBER_SECTIONS: Record<string, string> = {
  overview: 'overview',
  events: 'events',
  sessions: 'sessions',
  compare: 'compare',
  breakdown: 'breakdown',
  goals: 'goals',
  funnel: 'funnels',
  journeys: 'journeys',
  retention: 'retention',
  utm: 'utm',
  revenue: 'revenue',
  attribution: 'attribution',
  realtime: 'realtime',
  performance: 'performance',
};

// Filters, which a share link can also use.
const MEMBER_ALWAYS = ['segments', 'cohorts'];

export function useWebsiteNavItems(websiteId: string) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();
  const config = useConfig();
  const { user } = useLoginQuery();
  const { data: website } = useWebsiteQuery(websiteId);
  const teamId = !website?.userId ? website?.teamId : undefined;
  const { data: team } = useTeamQuery(teamId);
  const role = team?.members?.find(member => member.userId === user?.id)?.role;
  const memberSections: string[] | null =
    !user?.isAdmin && role === ROLES.teamViewOnly && Array.isArray(team?.viewOnlySections)
      ? ['overview', ...team.viewOnlySections]
      : null;
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

  const allItems = [
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

  const items = memberSections
    ? allItems
        .map(section => ({
          ...section,
          items: section.items.filter(
            ({ id }) =>
              MEMBER_ALWAYS.includes(id) ||
              (MEMBER_SECTIONS[id] && memberSections.includes(MEMBER_SECTIONS[id])),
          ),
        }))
        .filter(section => section.items.length > 0)
    : allItems;

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
