'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { PageBody } from '@/components/common/PageBody';
import { SideMenu } from '@/components/common/SideMenu';
import { UserCircle, Users, Knobs } from '@/components/icons';

export function SettingsLayout({ children }: { children: ReactNode }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, pathname } = useNavigation();

  const items = [
    {
      label: formatMessage(labels.application),
      items: [
        {
          id: 'preferences',
          label: formatMessage(labels.preferences),
          path: renderUrl('/settings/preferences'),
          icon: <Knobs />,
        },
      ],
    },
    {
      label: formatMessage(labels.account),
      items: [
        {
          id: 'profile',
          label: formatMessage(labels.profile),
          path: renderUrl('/settings/profile'),
          icon: <UserCircle />,
        },
        {
          id: 'teams',
          label: formatMessage(labels.teams),
          path: renderUrl('/settings/teams'),
          icon: <Users />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id;

  return (
    <Grid columns="auto 1fr" width="100%" height="100%">
      <Column height="100%" border="right" backgroundColor>
        <SideMenu
          items={items}
          title={formatMessage(labels.settings)}
          selectedKey={selectedKey}
          allowMinimize={false}
          muteItems={false}
        />
      </Column>
      <Column gap="6" margin="2">
        <PageBody>{children}</PageBody>
      </Column>
    </Grid>
  );
}
