import { Column, Icon, Row, Text, ThemeButton } from '@umami/react-zen';
import { SideMenu } from '@/components/common/SideMenu';
import { useMessages, useNavigation, useShare } from '@/components/hooks';
import { AlignEndHorizontal, Clock, Eye, Sheet, Tag, User } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { PreferencesButton } from '@/components/input/PreferencesButton';
import { Funnel, Lightning, Logo, Magnet, Money, Network, Path, Target } from '@/components/svg';

export function ShareNav({ onItemClick }: { onItemClick?: () => void }) {
  const share = useShare();
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();
  const { slug, parameters, whiteLabel } = share;

  const logoUrl = whiteLabel?.url || 'https://umami.is';
  const logoName = whiteLabel?.name || 'umami';
  const logoImage = whiteLabel?.image;

  const renderPath = (path: string) => `/share/${slug}${path}`;

  const allItems = [
    {
      section: 'traffic',
      label: formatMessage(labels.traffic),
      items: [
        {
          id: 'overview',
          label: formatMessage(labels.overview),
          icon: <Eye />,
          path: renderPath(''),
        },
        {
          id: 'events',
          label: formatMessage(labels.events),
          icon: <Lightning />,
          path: renderPath('/events'),
        },
        {
          id: 'sessions',
          label: formatMessage(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
        },
        {
          id: 'realtime',
          label: formatMessage(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
        {
          id: 'compare',
          label: formatMessage(labels.compare),
          icon: <AlignEndHorizontal />,
          path: renderPath('/compare'),
        },
        {
          id: 'breakdown',
          label: formatMessage(labels.breakdown),
          icon: <Sheet />,
          path: renderPath('/breakdown'),
        },
      ],
    },
    {
      section: 'behavior',
      label: formatMessage(labels.behavior),
      items: [
        {
          id: 'goals',
          label: formatMessage(labels.goals),
          icon: <Target />,
          path: renderPath('/goals'),
        },
        {
          id: 'funnels',
          label: formatMessage(labels.funnels),
          icon: <Funnel />,
          path: renderPath('/funnels'),
        },
        {
          id: 'journeys',
          label: formatMessage(labels.journeys),
          icon: <Path />,
          path: renderPath('/journeys'),
        },
        {
          id: 'retention',
          label: formatMessage(labels.retention),
          icon: <Magnet />,
          path: renderPath('/retention'),
        },
      ],
    },
    {
      section: 'growth',
      label: formatMessage(labels.growth),
      items: [
        {
          id: 'utm',
          label: formatMessage(labels.utm),
          icon: <Tag />,
          path: renderPath('/utm'),
        },
        {
          id: 'revenue',
          label: formatMessage(labels.revenue),
          icon: <Money />,
          path: renderPath('/revenue'),
        },
        {
          id: 'attribution',
          label: formatMessage(labels.attribution),
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
      items: section.items.filter(item => parameters[item.id] !== false),
    }))
    .filter(section => section.items.length > 0);

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id;

  return (
    <Column position="fixed" padding="3" width="240px" maxHeight="100vh" height="100vh">
      <Row as="header" gap alignItems="center" paddingY="3" marginLeft="3">
        <a href={logoUrl} target="_blank" rel="noopener">
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
      </Row>
      <Column>
        <SideMenu
          items={items}
          selectedKey={selectedKey}
          allowMinimize={false}
          onItemClick={onItemClick}
        />
      </Column>
      <Column flexGrow={1} justifyContent="flex-end">
        <Row>
          <ThemeButton />
          <LanguageButton />
          <PreferencesButton />
        </Row>
      </Column>
    </Column>
  );
}
