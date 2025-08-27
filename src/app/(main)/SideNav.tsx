import Link from 'next/link';
import {
  Sidebar,
  SidebarSection,
  SidebarItem,
  SidebarHeader,
  Row,
  SidebarProps,
  ThemeButton,
} from '@umami/react-zen';
import {
  Globe,
  LayoutDashboard,
  Link as LinkIcon,
  Logo,
  Pixel,
  Settings,
  PanelLeft,
} from '@/components/icons';
import { useMessages, useNavigation, useGlobalState } from '@/components/hooks';
import { TeamsButton } from '@/components/input/TeamsButton';
import { PanelButton } from '@/components/input/PanelButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { LanguageButton } from '@/components/input/LanguageButton';

export function SideNav(props: SidebarProps) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');

  const hasNav = !!(websiteId || pathname.startsWith('/admin') || pathname.includes('/settings'));

  const links = [
    {
      id: 'boards',
      label: formatMessage(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      path: '/websites',
      icon: <Globe />,
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
      icon: <Pixel />,
    },
  ];

  const bottomLinks = [
    {
      id: 'settings',
      label: formatMessage(labels.settings),
      path: renderUrl('/settings'),
      icon: <Settings />,
    },
  ];

  return (
    <Row height="100%" backgroundColor border="right">
      <Sidebar {...props} isCollapsed={isCollapsed || hasNav} muteItems={false} showBorder={false}>
        <SidebarSection onClick={() => setIsCollapsed(false)}>
          <SidebarHeader
            label="umami"
            icon={isCollapsed && !hasNav ? <PanelLeft /> : <Logo />}
            style={{ maxHeight: 40 }}
          >
            {!isCollapsed && !hasNav && <PanelButton />}
          </SidebarHeader>
        </SidebarSection>
        <SidebarSection style={{ paddingTop: 0, paddingBottom: 0 }}>
          <TeamsButton showText={!hasNav && !isCollapsed} />
        </SidebarSection>
        <SidebarSection flexGrow={1}>
          {links.map(({ id, path, label, icon }) => {
            return (
              <Link key={id} href={renderUrl(path, false)} role="button">
                <SidebarItem
                  label={label}
                  icon={icon}
                  isSelected={pathname.endsWith(path)}
                  role="button"
                />
              </Link>
            );
          })}
        </SidebarSection>
        <SidebarSection>
          {bottomLinks.map(({ id, path, label, icon }) => {
            return (
              <Link key={id} href={path} role="button">
                <SidebarItem
                  label={label}
                  icon={icon}
                  isSelected={pathname.includes(path)}
                  role="button"
                />
              </Link>
            );
          })}
          <Row alignItems="center" justifyContent="space-between" height="40px">
            <ProfileButton />
            {!isCollapsed && !hasNav && (
              <Row>
                <LanguageButton />
                <ThemeButton />
              </Row>
            )}
          </Row>
        </SidebarSection>
      </Sidebar>
    </Row>
  );
}
