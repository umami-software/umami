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
} from '@/components/icons';
import { useMessages, useNavigation, useGlobalState } from '@/components/hooks';

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();
  const [isCollapsed, setCollapsed] = useGlobalState('sidenav-collapsed');

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
    <Sidebar {...props} isCollapsed={isCollapsed} variant="quiet" showBorder={true}>
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
        {bottomLinks.map(({ id, path, label, icon }) => {
          return (
            <Link key={id} href={path} role="button">
              <SidebarItem label={label} icon={icon} isSelected={pathname.startsWith(path)} />
            </Link>
          );
        })}
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
