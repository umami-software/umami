import { useState } from 'react';
import Link from 'next/link';
import {
  SideNav,
  SideNavHeader,
  SideNavSection,
  SideNavItem,
  Button,
  Icon,
  Row,
} from '@umami/react-zen';
import { Lucide, Icons } from '@/components/icons';
import { useMessages, useTeamUrl } from '@/components/hooks';

export function Nav() {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();
  const [isCollapsed, setCollapsed] = useState(false);

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
    <SideNav isCollapsed={isCollapsed}>
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
      <SideNavSection>
        <Row justifyContent="flex-start">
          <Button onPress={() => setCollapsed(!isCollapsed)} variant="quiet">
            <Icon>
              <Lucide.PanelLeft />
            </Icon>
          </Button>
        </Row>
      </SideNavSection>
    </SideNav>
  );
}
