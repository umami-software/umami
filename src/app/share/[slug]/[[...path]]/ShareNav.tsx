import { Button, Column, Icon, Row, Text, ThemeButton } from '@umami/react-zen';
import { NavMenu } from '@/components/common/NavMenu';
import { useMessages, useNavigation, useShare } from '@/components/hooks';
import { AlignEndHorizontal, Clock, Eye, PanelLeft, Sheet, Tag, User } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { PreferencesButton } from '@/components/input/PreferencesButton';
import { Funnel, Lightning, Logo, Magnet, Money, Network, Path, Target } from '@/components/svg';

export function ShareNav({
  collapsed,
  onCollapse,
  onItemClick,
}: {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onItemClick?: () => void;
}) {
  const share = useShare();
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const { slug, parameters, whiteLabel } = share;

  const logoUrl = whiteLabel?.url || 'https://umami.is';
  const logoName = whiteLabel?.name || 'umami';
  const logoImage = whiteLabel?.image;

  const renderPath = (path: string) => `/share/${slug}${path}`;

  const allItems = [
    {
      section: 'traffic',
      label: t(labels.traffic),
      items: [
        {
          id: 'overview',
          label: t(labels.overview),
          icon: <Eye />,
          path: renderPath(''),
        },
        {
          id: 'events',
          label: t(labels.events),
          icon: <Lightning />,
          path: renderPath('/events'),
        },
        {
          id: 'sessions',
          label: t(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
        },
        {
          id: 'realtime',
          label: t(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
        {
          id: 'compare',
          label: t(labels.compare),
          icon: <AlignEndHorizontal />,
          path: renderPath('/compare'),
        },
        {
          id: 'breakdown',
          label: t(labels.breakdown),
          icon: <Sheet />,
          path: renderPath('/breakdown'),
        },
      ],
    },
    {
      section: 'behavior',
      label: t(labels.behavior),
      items: [
        {
          id: 'goals',
          label: t(labels.goals),
          icon: <Target />,
          path: renderPath('/goals'),
        },
        {
          id: 'funnels',
          label: t(labels.funnels),
          icon: <Funnel />,
          path: renderPath('/funnels'),
        },
        {
          id: 'journeys',
          label: t(labels.journeys),
          icon: <Path />,
          path: renderPath('/journeys'),
        },
        {
          id: 'retention',
          label: t(labels.retention),
          icon: <Magnet />,
          path: renderPath('/retention'),
        },
      ],
    },
    {
      section: 'growth',
      label: t(labels.growth),
      items: [
        {
          id: 'utm',
          label: t(labels.utm),
          icon: <Tag />,
          path: renderPath('/utm'),
        },
        {
          id: 'revenue',
          label: t(labels.revenue),
          icon: <Money />,
          path: renderPath('/revenue'),
        },
        {
          id: 'attribution',
          label: t(labels.attribution),
          icon: <Network />,
          path: renderPath('/attribution'),
        },
      ],
    },
  ];

  // Filter items based on parameters
  const items = allItems
    .map(section => ({
      label: section.label,
      items: section.items.filter(item => parameters[item.id] === true),
    }))
    .filter(section => section.items.length > 0);

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id;

  const isMobile = !!onItemClick;

  return (
    <Column
      position={isMobile ? undefined : 'fixed'}
      padding="3"
      width={isMobile ? '100%' : collapsed ? '60px' : '240px'}
      maxHeight="100dvh"
      height="100dvh"
      border={isMobile ? undefined : 'right'}
    >
      <Row as="header" gap alignItems="center" justifyContent="space-between">
        {!collapsed && (
          <a href={logoUrl} target="_blank" rel="noopener" style={{ marginLeft: 12 }}>
            <Row alignItems="center" gap>
              {logoImage ? (
                <img src={logoImage} alt={logoName} style={{ height: 24 }} />
              ) : (
                <Icon>
                  <Logo />
                </Icon>
              )}
              <Text weight="bold">{logoName}</Text>
            </Row>
          </a>
        )}
        {!onItemClick && (
          <Button variant="quiet" onPress={() => onCollapse?.(!collapsed)}>
            <Icon color="muted">
              <PanelLeft />
            </Icon>
          </Button>
        )}
      </Row>
      {!collapsed && (
        <Column flexGrow={1} overflowY="auto">
          <NavMenu
            items={items}
            selectedKey={selectedKey}
            allowMinimize={false}
            onItemClick={onItemClick}
          />
        </Column>
      )}
      <Column
        flexGrow={collapsed ? 1 : undefined}
        justifyContent="flex-end"
        alignItems={collapsed ? 'center' : undefined}
      >
        {collapsed ? (
          <Column gap="2" alignItems="center">
            <ThemeButton />
            <LanguageButton />
            <PreferencesButton />
          </Column>
        ) : (
          <Row>
            <ThemeButton />
            <LanguageButton />
            <PreferencesButton />
          </Row>
        )}
      </Column>
    </Column>
  );
}
