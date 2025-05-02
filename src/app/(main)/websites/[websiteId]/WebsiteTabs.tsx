import { Tabs, TabList, Tab, Icon, Text, Row } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';

export function WebsiteTabs({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderTeamUrl } = useNavigation();

  const links = [
    {
      id: 'overview',
      label: formatMessage(labels.overview),
      icon: <Icons.Overview />,
      path: '',
    },
    {
      id: 'events',
      label: formatMessage(labels.events),
      icon: <Icons.Lightning />,
      path: '/events',
    },
    {
      id: 'sessions',
      label: formatMessage(labels.sessions),
      icon: <Icons.User />,
      path: '/sessions',
    },
    {
      id: 'realtime',
      label: formatMessage(labels.realtime),
      icon: <Icons.Clock />,
      path: '/realtime',
    },
    {
      id: 'reports',
      label: formatMessage(labels.reports),
      icon: <Icons.Reports />,
      path: '/reports',
    },
  ];

  const selectedKey = links
    ? links.find(({ path }) => path && pathname.endsWith(path))?.id
    : 'overview';

  return (
    <Tabs selectedKey={selectedKey}>
      <TabList items={links}>
        {({ id, label, icon, path }) => {
          return (
            <Tab id={id} href={renderTeamUrl(`/websites/${websiteId}/${path}`)}>
              <Row gap="3" alignItems="center">
                <Icon fillColor="currentColor">{icon}</Icon>
                <Text>{label}</Text>
              </Row>
            </Tab>
          );
        }}
      </TabList>
    </Tabs>
  );
}
