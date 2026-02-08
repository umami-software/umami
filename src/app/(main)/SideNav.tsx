import {
  Button,
  type ButtonProps,
  Column,
  Focusable,
  Icon,
  Row,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import Link from 'next/link';
import { SettingsNav } from '@/app/(main)/settings/SettingsNav';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { IconLabel } from '@/components/common/IconLabel';
import { useGlobalState, useMessages, useNavigation } from '@/components/hooks';
import { Globe, Grid2x2, LayoutDashboard, LinkIcon, PanelLeft } from '@/components/icons';
import { UserButton } from '@/components/input/UserButton';
import { Logo } from '@/components/svg';

export function SideNav(props: any) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl, websiteId } = useNavigation();
  const [isCollapsed] = useGlobalState('sidenav-collapsed', false);

  const links = [
    {
      id: 'boards',
      label: t(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: t(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'links',
      label: t(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: t(labels.pixels),
      path: '/pixels',
      icon: <Grid2x2 />,
    },
  ];

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
        {websiteId ? (
          <WebsiteNav websiteId={websiteId} isCollapsed={isCollapsed} />
        ) : pathname.includes('/settings') ? (
          <SettingsNav isCollapsed={isCollapsed} />
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
      <Row marginBottom="4">
        <UserButton showText={!isCollapsed} />
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
