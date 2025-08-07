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
import { SideMenu } from '@/components/common/SideMenu';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function WebsiteNav({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, teamId } = useNavigation();

  const renderPath = (path: string) => renderUrl(`/websites/${websiteId}${path}`);

  const items = [
    {
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
          id: 'breakdown',
          label: formatMessage(labels.breakdown),
          icon: <Sheet />,
          path: renderPath('/breakdown'),
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
          path: renderPath('/goals'),
        },
        {
          id: 'funnel',
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
      label: formatMessage(labels.segments),
      items: [
        {
          id: 'segments',
          label: formatMessage(labels.segments),
          icon: <ChartPie />,
          path: renderPath('/segments'),
        },
        {
          id: 'cohorts',
          label: formatMessage(labels.cohorts),
          icon: <UserPlus />,
          path: renderPath('/cohorts'),
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

  const selectedKey =
    items.flatMap(e => e.items).find(({ path }) => path && pathname.endsWith(path))?.id ||
    'overview';

  return (
    <SideMenu items={items} selectedKey={selectedKey} allowMinimize={false}>
      <WebsiteSelect buttonProps={{ variant: 'quiet' }} websiteId={websiteId} teamId={teamId} />
    </SideMenu>
  );
}
