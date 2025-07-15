import { ReactNode } from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  Button,
  Icon,
  Row,
} from '@umami/react-zen';
import {
  Globe,
  LayoutDashboard,
  Link as LinkIcon,
  Logo,
  Grid2X2,
  Settings,
  LockKeyhole,
  PanelLeft,
  Eye,
  Lightning,
  User,
  Clock,
  Target,
  Funnel,
  Path,
  Magnet,
  Tag,
  Money,
  Network,
  Arrow,
  Sheet,
} from '@/components/icons';
import { useMessages, useNavigation, useGlobalState } from '@/components/hooks';
import { LinkButton } from '@/components/common/LinkButton';

type NavLink = {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
};

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { websiteId, pathname, renderUrl } = useNavigation();
  const [isCollapsed, setCollapsed] = useGlobalState('sidenav-collapsed');
  const isWebsite = websiteId && !pathname.includes('/settings');

  const links = [
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'boards',
      label: formatMessage(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'links',
      label: formatMessage(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: formatMessage(labels.pixels),
      path: '/pixels',
      icon: <Grid2X2 />,
    },
  ];

  const websiteLinks = [
    {
      id: 'overview',
      label: formatMessage(labels.overview),
      icon: <Eye />,
      path: '/',
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
      id: 'breakdown',
      label: formatMessage(labels.breakdown),
      icon: <Sheet />,
      path: '/breakdown',
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

  const bottomLinks = [
    {
      id: 'settings',
      label: formatMessage(labels.settings),
      path: '/settings',
      icon: <Settings />,
    },
    {
      id: 'admin',
      label: formatMessage(labels.admin),
      path: '/admin',
      icon: <LockKeyhole />,
    },
  ];

  return (
    <Sidebar {...props} isCollapsed={isCollapsed} variant="quiet" showBorder={true}>
      <SidebarSection>
        <SidebarHeader label="umami" icon={<Logo />} />
      </SidebarSection>
      <SidebarSection flexGrow={1}>
        {!isWebsite && <NavItems items={links} params={false} />}
        {isWebsite && (
          <>
            <Row>
              <LinkButton href={renderUrl('/websites', false)} variant="outline">
                <Icon rotate={180}>
                  <Arrow />
                </Icon>
              </LinkButton>
            </Row>
            <NavItems items={websiteLinks} prefix={`/websites/${websiteId}`} />
          </>
        )}
      </SidebarSection>
      <SidebarSection>
        {!isWebsite && <NavItems items={bottomLinks} params={false} />}
      </SidebarSection>
      <SidebarSection>
        <Row>
          <Button onPress={() => setCollapsed(!isCollapsed)} variant="quiet">
            <Icon>
              <PanelLeft />
            </Icon>
          </Button>
        </Row>
      </SidebarSection>
    </Sidebar>
  );
}

const NavItems = ({
  items,
  prefix = '',
  params,
}: {
  items: NavLink[];
  prefix?: string;
  params?: Record<string, string | number> | false;
}) => {
  const { renderUrl, pathname, websiteId } = useNavigation();

  return items.map(({ id, path, label, icon }) => {
    const isSelected = websiteId
      ? (path === '/' && pathname.endsWith(websiteId)) || pathname.endsWith(path)
      : pathname.startsWith(path);
    return (
      <Link key={id} href={renderUrl(`${prefix}${path}`, params)} role="button">
        <SidebarItem label={label} icon={icon} isSelected={isSelected} />
      </Link>
    );
  });
};
