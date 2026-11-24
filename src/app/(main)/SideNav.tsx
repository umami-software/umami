import {
  Row,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  Text,
  useSidebar,
} from '@umami/react-zen';
import type { ReactNode } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import {
  useAdminNavItems,
  useConfig,
  useMessages,
  useNavigation,
  useSettingsNavItems,
  useWebsiteNavItems,
} from '@/components/hooks';
import {
  ArrowLeft,
  Globe,
  Grid2x2,
  LayoutDashboard,
  LinkIcon,
  PanelsLeftBottom,
  Settings,
} from '@/components/icons';
import { UserButton } from '@/components/input/UserButton';
import { Logo } from '@/components/svg';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

export function SideNav() {
  const { pathname, websiteId } = useNavigation();
  const { cloudMode } = useConfig();
  const { t, labels } = useMessages();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const settingsUrl = cloudMode ? `${process.env.cloudUrl}/settings` : '/settings';

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Row
          alignItems="center"
          justifyContent={isCollapsed ? 'center' : 'space-between'}
          minHeight="9"
          paddingLeft={isCollapsed ? undefined : '2'}
        >
          {!isCollapsed && (
            <IconLabel icon={<Logo />}>
              <Text weight="bold">umami</Text>
            </IconLabel>
          )}
          <SidebarTrigger />
        </Row>
      </SidebarHeader>
      <SidebarContent>
        {websiteId ? (
          <WebsiteGroups websiteId={websiteId} />
        ) : pathname.includes('/settings') ? (
          <SettingsGroups />
        ) : pathname.includes('/admin') ? (
          <AdminGroups />
        ) : (
          <MainGroups />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <NavMenuItem
            item={{
              id: 'settings',
              label: t(labels.settings),
              path: settingsUrl,
              icon: <Settings />,
            }}
            isActive={!cloudMode && pathname.includes('/settings')}
          />
          <SidebarMenuItem>
            <UserButton showText={!isCollapsed} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function MainGroups() {
  const { t, labels } = useMessages();
  const { pathname, renderUrl, teamId } = useNavigation();

  const items: NavItem[] = [
    ...(!teamId
      ? [
          {
            id: 'dashboard',
            label: t(labels.dashboard),
            path: renderUrl('/dashboard', false),
            icon: <PanelsLeftBottom />,
          },
        ]
      : []),
    {
      id: 'boards',
      label: t(labels.boards),
      path: renderUrl('/boards', false),
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: t(labels.websites),
      path: renderUrl('/websites', false),
      icon: <Globe />,
    },
    {
      id: 'links',
      label: t(labels.links),
      path: renderUrl('/links', false),
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: t(labels.pixels),
      path: renderUrl('/pixels', false),
      icon: <Grid2x2 />,
    },
  ];

  const selectedKey = items.find(({ path }) => pathname.startsWith(path))?.id;

  return <NavGroups groups={[{ items }]} selectedKey={selectedKey} />;
}

function WebsiteGroups({ websiteId }: { websiteId: string }) {
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

  return <NavGroups groups={items} selectedKey={selectedKey} showBack />;
}

function SettingsGroups() {
  const { items, selectedKey } = useSettingsNavItems();

  return <NavGroups groups={items} selectedKey={selectedKey} showBack />;
}

function AdminGroups() {
  const { items, selectedKey } = useAdminNavItems();

  return <NavGroups groups={items} selectedKey={selectedKey} showBack />;
}

function NavGroups({
  groups,
  selectedKey,
  showBack,
}: {
  groups: NavGroup[];
  selectedKey?: string;
  showBack?: boolean;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <>
      {showBack && (
        <SidebarGroup>
          <SidebarMenu>
            <NavMenuItem
              item={{
                id: 'back',
                label: t(labels.back),
                path: renderUrl('/websites', false),
                icon: <ArrowLeft />,
              }}
            />
          </SidebarMenu>
        </SidebarGroup>
      )}
      {groups.map(({ label, items }, index) => (
        <SidebarGroup key={`${label}${index}`}>
          {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <NavMenuItem key={item.id} item={item} isActive={item.id === selectedKey} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavMenuItem({ item, isActive }: { item: NavItem; isActive?: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.path} />}
        isActive={isActive}
        tooltip={item.label}
      >
        {item.icon}
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
