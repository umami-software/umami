import {
  Button,
  type ButtonProps,
  Column,
  Focusable,
  Icon,
  Row,
  Text,
  ThemeButton,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import Link from 'next/link';
import type { Key } from 'react';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { IconLabel } from '@/components/common/IconLabel';
import { useGlobalState, useMessages, useNavigation } from '@/components/hooks';
import { Globe, Grid2x2, LayoutDashboard, LinkIcon, PanelLeft } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { NavButton } from '@/components/input/NavButton';
import { Logo } from '@/components/svg';

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId, router } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed', false);

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
      icon: <Grid2x2 />,
    },
  ];

  const handleSelect = (id: Key) => {
    router.push(id === 'user' ? '/websites' : `/teams/${id}/websites`);
  };

  return (
    <Column
      {...props}
      backgroundColor="surface-base"
      justifyContent="space-between"
      border
      borderRadius
      paddingX="2"
      height="100%"
      margin="2"
      style={{
        width: isCollapsed ? '55px' : '240px',
        transition: 'width 0.2s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <Column style={{ minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <Row
          alignItems="center"
          justifyContent="space-between"
          height="60px"
          style={{ flexShrink: 0 }}
        >
          <Row paddingX="3" alignItems="center" justifyContent="space-between" flexGrow={1}>
            {!isCollapsed && (
              <IconLabel icon={<Logo />}>
                <Text weight="bold">umami</Text>
              </IconLabel>
            )}
            <PanelButton />
          </Row>
        </Row>
        <Row marginBottom="4" style={{ flexShrink: 0 }}>
          <NavButton showText={!isCollapsed} onAction={handleSelect} />
        </Row>
        {websiteId ? (
          <WebsiteNav websiteId={websiteId} isCollapsed={isCollapsed} />
        ) : (
          <Column gap="2">
            {links.map(({ id, path, label, icon }) => {
              const isSelected = pathname.startsWith(renderUrl(path, false));
              return (
                <Link key={id} href={renderUrl(path, false)} role="button">
                  <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
                    <Focusable>
                      <Row
                        alignItems="center"
                        hover={{ backgroundColor: 'surface-sunken' }}
                        backgroundColor={isSelected ? 'surface-sunken' : undefined}
                        borderRadius
                        minHeight="40px"
                      >
                        <IconLabel
                          icon={icon}
                          label={isCollapsed ? '' : label}
                          weight={isSelected ? 'bold' : undefined}
                          padding
                        />
                      </Row>
                    </Focusable>
                    <Tooltip placement="right">{label}</Tooltip>
                  </TooltipTrigger>
                </Link>
              );
            })}
          </Column>
        )}
      </Column>
      <Row alignItems="center" justifyContent="center" wrap="wrap" marginBottom="4" gap>
        <LanguageButton />
        <ThemeButton />
      </Row>
    </Column>
  );
}

const PanelButton = (props: ButtonProps) => {
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed', false);
  return (
    <Button
      onPress={() => setIsCollapsed(!isCollapsed)}
      variant="zero"
      {...props}
      style={{ padding: 0 }}
    >
      <Icon strokeColor="muted">
        <PanelLeft />
      </Icon>
    </Button>
  );
};
