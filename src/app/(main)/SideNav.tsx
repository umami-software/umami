import Link from 'next/link';
import {
  Sidebar,
  SidebarSection,
  SidebarItem,
  SidebarHeader,
  Row,
  SidebarProps,
} from '@umami/react-zen';
import {
  Globe,
  LayoutDashboard,
  Link as LinkIcon,
  Logo,
  Grid2X2,
  Settings,
  LockKeyhole,
} from '@/components/icons';
import { useMessages, useNavigation, useGlobalState } from '@/components/hooks';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';

export function SideNav(props: SidebarProps) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId, teamId } = useNavigation();
  const [isCollapsed] = useGlobalState('sidenav-collapsed');
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
    <Row height="100%" backgroundColor border="right">
      <Sidebar
        {...props}
        isCollapsed={isCollapsed || isWebsite}
        muteItems={false}
        variant="quiet"
        showBorder={false}
      >
        <SidebarSection>
          <SidebarHeader label="umami" icon={<Logo />} />
        </SidebarSection>
        <SidebarSection flexGrow={1}>
          {links.map(({ id, path, label, icon }) => {
            return (
              <Link key={id} href={renderUrl(path, false)} role="button">
                <SidebarItem label={label} icon={icon} isSelected={pathname.endsWith(path)} />
              </Link>
            );
          })}
        </SidebarSection>
        <SidebarSection>
          {!teamId &&
            bottomLinks.map(({ id, path, label, icon }) => {
              return (
                <Link key={id} href={path} role="button">
                  <SidebarItem label={label} icon={icon} isSelected={pathname.startsWith(path)} />
                </Link>
              );
            })}
        </SidebarSection>
      </Sidebar>
      {isWebsite && <WebsiteNav websiteId={websiteId} />}
    </Row>
  );
}
