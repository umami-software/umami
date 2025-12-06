import {
  Row,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  type SidebarProps,
  SidebarSection,
  ThemeButton,
} from '@umami/react-zen';
import Link from 'next/link';
import type { Key } from 'react';
import { useGlobalState, useMessages, useNavigation } from '@/components/hooks';
import { Globe, Grid2x2, LinkIcon, PanelLeft } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { NavButton } from '@/components/input/NavButton';
import { PanelButton } from '@/components/input/PanelButton';
import { Logo } from '@/components/svg';

export function SideNav(props: SidebarProps) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId, router } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');

  const hasNav = !!(websiteId || pathname.startsWith('/admin') || pathname.includes('/settings'));

  const links = [
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
      icon: <Grid2x2 />,
    },
  ];

  const handleSelect = (id: Key) => {
    router.push(id === 'user' ? '/websites' : `/teams/${id}/websites`);
  };

  return (
    <Sidebar {...props} isCollapsed={isCollapsed || hasNav} backgroundColor>
      <SidebarSection onClick={() => setIsCollapsed(false)}>
        <SidebarHeader
          label="umami"
          icon={isCollapsed && !hasNav ? <PanelLeft /> : <Logo />}
          style={{ maxHeight: 40 }}
        >
          {!isCollapsed && !hasNav && <PanelButton />}
        </SidebarHeader>
      </SidebarSection>
      <SidebarSection paddingTop="0" paddingBottom="0" justifyContent="center">
        <NavButton showText={!hasNav && !isCollapsed} onAction={handleSelect} />
      </SidebarSection>
      <SidebarSection flexGrow={1}>
        {links.map(({ id, path, label, icon }) => {
          return (
            <Link key={id} href={renderUrl(path, false)} role="button">
              <SidebarItem
                label={label}
                icon={icon}
                isSelected={pathname.includes(path)}
                role="button"
              />
            </Link>
          );
        })}
      </SidebarSection>
      <SidebarSection justifyContent="flex-start">
        <Row wrap="wrap">
          <LanguageButton />
          <ThemeButton />
        </Row>
      </SidebarSection>
    </Sidebar>
  );
}
