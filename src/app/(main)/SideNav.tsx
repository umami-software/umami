import Link from 'next/link';
import { SideNav as Nav, SideNavHeader, SideNavSection, SideNavItem } from '@umami/react-zen';
import { Lucide, Icons } from '@/components/icons';
import { useMessages, useTeamUrl } from '@/components/hooks';

export function SideNav() {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();

  const links = [
    {
      label: formatMessage(labels.boards),
      href: renderTeamUrl('/boards'),
      icon: <Lucide.LayoutDashboard />,
    },
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
      label: formatMessage(labels.reports),
      href: renderTeamUrl('/reports'),
      icon: <Lucide.ChartArea />,
    },
    {
      label: formatMessage(labels.settings),
      href: renderTeamUrl('/settings'),
      icon: <Lucide.Settings />,
    },
  ].filter(n => n);

  return (
    <Nav>
      <SideNavSection>
        <SideNavHeader name="umami" icon={<Icons.Logo />} />
      </SideNavSection>
      <SideNavSection>
        {links.map(({ href, label, icon }) => {
          return (
            <Link key={href} href={href}>
              <SideNavItem label={label} icon={icon} />
            </Link>
          );
        })}
      </SideNavSection>
    </Nav>
  );
}
