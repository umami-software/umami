'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { User, Users, Globe } from '@/components/icons';
import { SideMenu } from '@/components/common/SideMenu';
import { PageBody } from '@/components/common/PageBody';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();

  if (!user.isAdmin || process.env.cloudMode) {
    return null;
  }

  const items = [
    {
      label: formatMessage(labels.manage),
      items: [
        {
          id: 'users',
          label: formatMessage(labels.users),
          path: '/admin/users',
          icon: <User />,
        },
        {
          id: 'websites',
          label: formatMessage(labels.websites),
          path: '/admin/websites',
          icon: <Globe />,
        },
        {
          id: 'teams',
          label: formatMessage(labels.teams),
          path: '/admin/teams',
          icon: <Users />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    ?.find(({ path }) => path && pathname.startsWith(path))?.id;

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
          title={formatMessage(labels.admin)}
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
