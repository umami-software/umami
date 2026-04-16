import { Icon, Row, Tab, TabList, Tabs, Text } from '@umami/react-zen';
import { useMessages, useNavigation, useWebsite } from '@/components/hooks';
import { ChartPie, Clock, Eye, User } from '@/components/icons';
import { Lightning } from '@/components/svg';

export function WebsiteTabs() {
  const website = useWebsite();
  const { pathname, renderUrl } = useNavigation();
  const { t, labels } = useMessages();

  const links = [
    {
      id: 'overview',
      label: t(labels.overview),
      icon: <Eye />,
      path: '',
    },
    {
      id: 'events',
      label: t(labels.events),
      icon: <Lightning />,
      path: '/events',
    },
    {
      id: 'sessions',
      label: t(labels.sessions),
      icon: <User />,
      path: '/sessions',
    },
    {
      id: 'realtime',
      label: t(labels.realtime),
      icon: <Clock />,
      path: '/realtime',
    },
    {
      id: 'reports',
      label: t(labels.reports),
      icon: <ChartPie />,
      path: '/reports',
    },
  ];

  const selectedKey = links.find(({ path }) => path && pathname.includes(path))?.id || 'overview';

  return (
    <Row marginBottom="6">
      <Tabs selectedKey={selectedKey}>
        <TabList>
          {links.map(({ id, label, icon, path }) => {
            return (
              <Tab key={id} id={id} href={renderUrl(`/websites/${website.id}${path}`)}>
                <Row alignItems="center" gap>
                  <Icon>{icon}</Icon>
                  <Text>{label}</Text>
                </Row>
              </Tab>
            );
          })}
        </TabList>
      </Tabs>
    </Row>
  );
}
