import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  Text,
  useSidebar,
} from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import {
  isMetricsPath,
  type NavItem,
  useAdminNavItems,
  useConfig,
  useMessages,
  useMetricsNavItems,
  useNavGroupOpen,
  useNavigation,
  useSettingsNavItems,
  useWebsiteNavItems,
} from '@/components/hooks';
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Grid2x2,
  LayoutDashboard,
  LinkIcon,
  PanelsLeftBottom,
  Settings,
} from '@/components/icons';
import { UserButton } from '@/components/input/UserButton';
import { Logo } from '@/components/svg';

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
      <SidebarHeader className="border-b">
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
        {isMetricsPath(pathname) ? (
          <MetricsGroups />
        ) : websiteId ? (
          <WebsiteGroups websiteId={websiteId} />
        ) : pathname.includes('/settings') ? (
          <SettingsGroups />
        ) : pathname.includes('/admin') ? (
          <AdminGroups />
        ) : (
          <MainGroups />
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
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

function MetricsGroups() {
  const { items, selectedKey, backItem } = useMetricsNavItems();

  return <NavGroups groups={items} selectedKey={selectedKey} backItem={backItem} />;
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
  backItem,
}: {
  groups: NavGroup[];
  selectedKey?: string;
  showBack?: boolean;
  /** Replaces the default back item, which goes to the websites list. */
  backItem?: NavItem;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const back = backItem ?? {
    id: 'back',
    label: t(labels.back),
    path: renderUrl('/websites', false),
    icon: <ArrowLeft />,
  };

  return (
    <>
      {(showBack || backItem) && (
        <SidebarGroup>
          <SidebarMenu>
            <NavMenuItem item={back} />
          </SidebarMenu>
        </SidebarGroup>
      )}
      {groups.map(({ label, items }, index) => (
        <SidebarGroup key={`${label}${index}`}>
          {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <NavMenuItem key={item.id} item={item} selectedKey={selectedKey} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavMenuItem({
  item,
  selectedKey,
  isActive,
}: {
  item: NavItem;
  selectedKey?: string;
  isActive?: boolean;
}) {
  if (item.children?.length > 0) {
    return <NavGroupItem item={item} selectedKey={selectedKey} />;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.path} />}
        isActive={isActive ?? item.id === selectedKey}
        tooltip={item.label}
      >
        {item.icon}
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** A nav item whose sub-items expand and collapse beneath it. */
function NavGroupItem({ item, selectedKey }: { item: NavItem; selectedKey?: string }) {
  const { state } = useSidebar();
  const { open, setOpen, hasSelectedChild } = useNavGroupOpen(item, selectedKey);

  // An icon-only sidebar has no room for sub-items, so the item links to its first page.
  if (state === 'collapsed') {
    return <NavMenuItem item={{ ...item, children: undefined }} isActive={hasSelectedChild} />;
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarMenuButton render={<CollapsibleTrigger />} isActive={item.id === selectedKey}>
          {item.icon}
          <span>{item.label}</span>
          <ChevronRight
            className="ml-auto transition-transform"
            style={{ transform: open ? 'rotate(90deg)' : undefined }}
          />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map(child => (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton
                  render={<Link href={child.path} />}
                  isActive={child.id === selectedKey}
                >
                  <span>{child.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
