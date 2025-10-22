'use client';
import { PageBody } from '@/components/common/PageBody';
import { SideMenu } from '@/components/common/SideMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { Settings2, UserCircle, Users } from '@/components/icons';
import { Column, Grid } from '@umami/react-zen';
import { ReactNode } from 'react';

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
          icon: <Settings2 />,
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
    .find(({ path }) => path && pathname.includes(path.split('?')[0]))?.id;

  return (
    <Grid columns={{ xs: '1fr', lg: 'auto 1fr' }} width="100%" height="100%">
      <Column
        display={{ xs: 'none', lg: 'flex' }}
        width="240px"
        height="100%"
        border="right"
        backgroundColor
        marginRight="2"
      >
        <SideMenu
          items={items}
          title={formatMessage(labels.settings)}
          selectedKey={selectedKey}
          allowMinimize={false}
        />
      </Column>
      <Column gap="6" margin="2">
        <PageBody>{children}</PageBody>
      </Column>
    </Grid>
  );
}
