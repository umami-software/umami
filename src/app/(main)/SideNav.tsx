import {
  Box,
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
import { IconLabel } from '@/components/common/IconLabel';
import { useGlobalState, useMessages, useNavigation, useWebsiteNavItems } from '@/components/hooks';
import {
  ArrowLeft,
  Globe,
  Grid2x2,
  LayoutDashboard,
  LinkIcon,
  PanelLeft,
} from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { NavButton } from '@/components/input/NavButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { Logo } from '@/components/svg';

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId, teamId, router } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');

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

  const handleWebsiteChange = (value: string) => {
    router.push(renderUrl(`/websites/${value}`));
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
      }}
    >
      <Column overflowY="auto" style={{ minHeight: 0 }}>
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
          <WebsiteNavSection
            websiteId={websiteId}
            teamId={teamId}
            isCollapsed={isCollapsed}
            onWebsiteChange={handleWebsiteChange}
          />
        ) : (
          <Column gap="2">
            {links.map(({ id, path, label, icon }) => {
              return (
                <Link key={id} href={renderUrl(path, false)} role="button">
                  <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
                    <Focusable>
                      <Row
                        alignItems="center"
                        hover={{ backgroundColor: 'surface-sunken' }}
                        borderRadius
                        minHeight="40px"
                      >
                        <IconLabel icon={icon} label={isCollapsed ? '' : label} padding />
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

function WebsiteNavSection({
  websiteId,
  teamId,
  isCollapsed,
  onWebsiteChange,
}: {
  websiteId: string;
  teamId: string;
  isCollapsed: boolean;
  onWebsiteChange: (value: string) => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

  const renderValue = (value: any) => {
    return (
      <Text truncate style={{ maxWidth: 160, lineHeight: 1 }}>
        {value?.selectedItem?.name}
      </Text>
    );
  };

  return (
    <Column gap="2">
      <Link href={renderUrl('/websites', false)} role="button">
        <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
          <Focusable>
            <Row
              alignItems="center"
              hover={{ backgroundColor: 'surface-sunken' }}
              borderRadius
              minHeight="40px"
            >
              <IconLabel
                icon={<ArrowLeft />}
                label={isCollapsed ? '' : formatMessage(labels.back)}
                padding
              />
            </Row>
          </Focusable>
          <Tooltip placement="right">{formatMessage(labels.back)}</Tooltip>
        </TooltipTrigger>
      </Link>
      {!isCollapsed && (
        <Box marginBottom="2">
          <WebsiteSelect
            websiteId={websiteId}
            teamId={teamId}
            onChange={onWebsiteChange}
            renderValue={renderValue}
            buttonProps={{ style: { outline: 'none' } }}
          />
        </Box>
      )}
      {items.map(({ label: sectionLabel, items: sectionItems }, index) => (
        <Column key={`${sectionLabel}${index}`} gap="1" marginBottom="1">
          {!isCollapsed && (
            <Row padding>
              <Text weight="bold">{sectionLabel}</Text>
            </Row>
          )}
          {sectionItems.map(({ id, path, label, icon }) => {
            const isSelected = selectedKey === id;
            return (
              <Link key={id} href={path} role="button">
                <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
                  <Focusable>
                    <Row
                      alignItems="center"
                      hover={{ backgroundColor: 'surface-sunken' }}
                      backgroundColor={isSelected ? 'surface-sunken' : undefined}
                      borderRadius
                      minHeight="40px"
                    >
                      <IconLabel icon={icon} label={isCollapsed ? '' : label} padding />
                    </Row>
                  </Focusable>
                  <Tooltip placement="right">{label}</Tooltip>
                </TooltipTrigger>
              </Link>
            );
          })}
        </Column>
      ))}
    </Column>
  );
}

const PanelButton = (props: ButtonProps) => {
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');
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
