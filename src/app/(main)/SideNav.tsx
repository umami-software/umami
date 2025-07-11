import Link from 'next/link';
import { Sidebar, SidebarHeader, SidebarSection, SidebarItem } from '@umami/react-zen';
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

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, pathname } = useNavigation();
  const [isCollapsed] = useGlobalState('sidenav-collapsed');

  const links = [
    {
      label: formatMessage(labels.websites),
      href: renderUrl('/websites', false),
      icon: <Globe />,
    },
    {
      label: formatMessage(labels.boards),
      href: renderUrl('/boards', false),
      icon: <LayoutDashboard />,
    },
    {
      label: formatMessage(labels.links),
      href: renderUrl('/links', false),
      icon: <LinkIcon />,
    },
    {
      label: formatMessage(labels.pixels),
      href: renderUrl('/pixels', false),
      icon: <Grid2X2 />,
    },
    {
      label: formatMessage(labels.settings),
      href: '/settings',
      icon: <Settings />,
    },
    {
      label: formatMessage(labels.admin),
      href: '/admin',
      icon: <LockKeyhole />,
    },
  ].filter(n => n);

  return (
    <Sidebar {...props} isCollapsed={isCollapsed} variant="0" showBorder={true}>
      <SidebarSection>
        <SidebarHeader label="umami" icon={<Logo />} />
      </SidebarSection>
      <SidebarSection>
        {links.map(({ href, label, icon }) => {
          return (
            <Link key={href} href={href} role="button">
              <SidebarItem label={label} icon={icon} isSelected={pathname.startsWith(href)} />
            </Link>
          );
        })}
      </SidebarSection>
      <SidebarSection alignSelf="end">{``}</SidebarSection>
    </Sidebar>
  );
}
