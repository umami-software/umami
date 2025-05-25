import Link from 'next/link';
import { Sidebar, SidebarHeader, SidebarSection, SidebarItem } from '@umami/react-zen';
import { Lucide, Icons } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import useGlobalState from '@/components/hooks/useGlobalState';

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl, pathname } = useNavigation();
  const [isCollapsed] = useGlobalState('sidenav-collapsed');

  const links = [
    {
      label: formatMessage(labels.dashboard),
      href: renderTeamUrl('/dashboard'),
      icon: <Lucide.Copy />,
    },
    {
      label: formatMessage(labels.websites),
      href: renderTeamUrl('/websites'),
      icon: <Lucide.Globe />,
    },
    {
      label: formatMessage(labels.boards),
      href: renderTeamUrl('/boards'),
      icon: <Lucide.LayoutDashboard />,
    },
    {
      label: formatMessage(labels.links),
      href: renderTeamUrl('/links'),
      icon: <Lucide.Link />,
    },
    {
      label: formatMessage(labels.pixels),
      href: renderTeamUrl('/pixels'),
      icon: <Lucide.Grid2X2 />,
    },
    {
      label: formatMessage(labels.settings),
      href: renderTeamUrl('/settings'),
      icon: <Lucide.Settings />,
    },
  ].filter(n => n);

  return (
    <Sidebar {...props} isCollapsed={isCollapsed} variant="0" showBorder={true}>
      <SidebarSection>
        <SidebarHeader label="umami" icon={<Icons.Logo />} />
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
