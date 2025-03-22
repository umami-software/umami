import { Tabs, TabList, Tab, Icon, Text, Row } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';

export function WebsiteTabs({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useNavigation();

  const links = [
    {
      label: formatMessage(labels.overview),
      icon: <Icons.Overview />,
      path: '',
    },
    {
      label: formatMessage(labels.events),
      icon: <Icons.Lightning />,
      path: '/events',
    },
    {
      label: formatMessage(labels.sessions),
      icon: <Icons.User />,
      path: '/sessions',
    },
    {
      label: formatMessage(labels.realtime),
      icon: <Icons.Clock />,
      path: '/realtime',
    },
    {
      label: formatMessage(labels.compare),
      icon: <Icons.Compare />,
      path: '/compare',
    },
    {
      label: formatMessage(labels.reports),
      icon: <Icons.Reports />,
      path: '/reports',
    },
  ].map((link, index) => ({ ...link, id: index }));

  return (
    <Tabs>
      <TabList items={links}>
        {({ label, icon, path }) => {
          return (
            <Tab key={path} href={renderTeamUrl(`/websites/${websiteId}/${path}`)}>
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
