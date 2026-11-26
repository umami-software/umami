import {
  Button,
  Column,
  Icon,
  Row,
  Text,
  ThemeButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@umami/react-zen';
import { SectionNavGroup } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import {
  isMetricsPath,
  type NavItem,
  type NavSection,
  useMessages,
  useMetricsNavItems,
  useNavigation,
  useShare,
} from '@/components/hooks';
import { AlignEndHorizontal, Clock, Eye, PanelLeft, Sheet, Tag, User } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { PreferencesButton } from '@/components/input/PreferencesButton';
import { Funnel, Gauge, Lightning, Magnet, Money, Network, Path, Target } from '@/components/svg';
import { allowShareFilter, excludeShareFilterParam, getShareTheme } from '@/lib/share';
import { buildPath } from '@/lib/url';
import { ShareBranding } from './ShareBranding';

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
  const { pathname, query } = useNavigation();
  const isMetrics = isMetricsPath(pathname);
  const metrics = useMetricsNavItems();
  const { slug, parameters } = share;
  const allowFilter = allowShareFilter(parameters);
  const shareTheme = getShareTheme(parameters);

  const renderPath = (path: string) =>
    buildPath(`/share/${slug}${path}`, {
      ...Object.fromEntries(
        Object.entries(query).filter(([key]) => {
          return allowFilter || !excludeShareFilterParam(key);
        }),
      ),
      event: undefined,
      compare: undefined,
      theme: undefined,
      view: undefined,
      unit: undefined,
      excludeBounce: undefined,
    });

  const allItems: (NavSection & { section: string })[] = [
    {
      section: 'traffic',
      label: t(labels.traffic),
      items: [
        { id: 'overview', label: t(labels.overview), icon: <Eye />, path: renderPath('') },
        {
          id: 'events',
          label: t(labels.events),
          icon: <Lightning />,
          path: renderPath('/events'),
          children: [
            { id: 'events-chart', label: t(labels.chart), path: renderPath('/events') },
            {
              id: 'events-activity',
              label: t(labels.activity),
              path: renderPath('/events/activity'),
            },
            {
              id: 'events-properties',
              label: t(labels.properties),
              path: renderPath('/events/properties'),
            },
          ],
        },
        {
          id: 'sessions',
          label: t(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
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
        { id: 'goals', label: t(labels.goals), icon: <Target />, path: renderPath('/goals') },
        { id: 'funnels', label: t(labels.funnels), icon: <Funnel />, path: renderPath('/funnels') },
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
        { id: 'utm', label: t(labels.utm), icon: <Tag />, path: renderPath('/utm') },
        { id: 'revenue', label: t(labels.revenue), icon: <Money />, path: renderPath('/revenue') },
        {
          id: 'attribution',
          label: t(labels.attribution),
          icon: <Network />,
          path: renderPath('/attribution'),
        },
      ],
    },
    {
      section: 'monitoring',
      label: t(labels.monitoring),
      items: [
        {
          id: 'realtime',
          label: t(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
        {
          id: 'performance',
          label: t(labels.performance),
          icon: <Gauge />,
          path: renderPath('/performance'),
        },
      ],
    },
  ];

  // On the metrics page, the metrics replace the share's pages, under a way back to the overview.
  const items = isMetrics
    ? [{ label: '', items: [metrics.backItem] }, ...metrics.items]
    : allItems
        .map(section => ({
          label: section.label,
          items: section.items.filter(item => parameters[item.id] === true),
        }))
        .filter(section => section.items.length > 0);

  // Sub-items come before their parent so they win when they share its path.
  const selectedKey = isMetrics
    ? metrics.selectedKey
    : items
        .flatMap(e => e.items)
        .flatMap((item: NavItem) => [...(item.children ?? []), item])
        .find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id;

  const isMobile = !!onItemClick;

  return (
    <Column
      position={isMobile ? undefined : 'fixed'}
      paddingX={collapsed ? '1' : '3'}
      paddingY="3"
      width={isMobile ? '100%' : collapsed ? '60px' : '240px'}
      maxHeight="100dvh"
      height="100dvh"
      border={isMobile ? undefined : 'right'}
    >
      <Row
        as="header"
        gap
        alignItems="center"
        justifyContent={collapsed ? 'center' : 'space-between'}
      >
        {!collapsed && <ShareBranding size="md" />}
        {!onItemClick && (
          <Button variant="ghost" onClick={() => onCollapse?.(!collapsed)}>
            <Icon color="muted">
              <PanelLeft />
            </Icon>
          </Button>
        )}
      </Row>
      <Column flexGrow={1} marginTop="2" overflowY="auto" gap="2">
        {items.map(({ label: sectionLabel, items: sectionItems }, index) => (
          <Column key={`${sectionLabel}${index}`} gap="1" marginBottom="1">
            {!collapsed && sectionLabel && (
              <Row paddingX="3" marginTop="2">
                <Text weight="bold">{sectionLabel}</Text>
              </Row>
            )}
            {sectionItems.map(({ id, path, label, icon, children }) => {
              // When collapsed the sub-items are hidden, so the parent shows their selection.
              const isSelected =
                selectedKey === id ||
                (collapsed && !!children?.some(child => child.id === selectedKey));
              if (!collapsed && children?.length > 0) {
                return (
                  <SectionNavGroup
                    key={id}
                    item={{ id, path, label, icon, children }}
                    selectedKey={selectedKey}
                    onItemClick={onItemClick}
                    minHeight="40px"
                  />
                );
              }

              return (
                <Link key={id} href={path} role="button" onClick={onItemClick}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger
                        delay={0}
                        render={
                          <Row
                            tabIndex={0}
                            alignItems="center"
                            justifyContent="center"
                            hover={{ backgroundColor: 'muted' }}
                            backgroundColor={isSelected ? 'muted' : undefined}
                            borderRadius
                            minHeight="40px"
                          />
                        }
                      >
                        <IconLabel icon={icon} label="" weight={isSelected ? 'bold' : undefined} />
                      </TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Row
                      alignItems="center"
                      hover={{ backgroundColor: 'muted' }}
                      backgroundColor={isSelected ? 'muted' : undefined}
                      borderRadius
                      minHeight="40px"
                    >
                      <IconLabel
                        icon={icon}
                        label={label}
                        weight={isSelected ? 'bold' : undefined}
                        padding
                      />
                    </Row>
                  )}
                </Link>
              );
            })}
          </Column>
        ))}
      </Column>
      <Column
        flexGrow={collapsed ? 1 : undefined}
        justifyContent="flex-end"
        alignItems={collapsed ? 'center' : undefined}
      >
        {collapsed ? (
          <Column gap="2" alignItems="center">
            {!shareTheme && <ThemeButton />}
            <LanguageButton />
            <PreferencesButton />
          </Column>
        ) : (
          <Row>
            {!shareTheme && <ThemeButton />}
            <LanguageButton />
            <PreferencesButton />
          </Row>
        )}
      </Column>
    </Column>
  );
}
