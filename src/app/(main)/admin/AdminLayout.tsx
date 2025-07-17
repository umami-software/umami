'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { SideMenu } from '@/components/common/SideMenu';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();

  if (!user.isAdmin) {
    return null;
  }

  const items = [
    {
      id: 'users',
      label: formatMessage(labels.users),
      url: '/admin/users',
    },
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      url: '/admin/websites',
    },
    {
      id: 'teams',
      label: formatMessage(labels.teams),
      url: '/admin/teams',
    },
  ];

  const value = items.find(({ url }) => pathname.includes(url))?.id;

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={formatMessage(labels.admin)} />
        <Grid columns="200px 1fr" gap>
          <Column>
            <SideMenu items={items} selectedKey={value} />
          </Column>
          <Column>
            <Panel minHeight="300px">{children}</Panel>
          </Column>
        </Grid>
      </Column>
    </PageBody>
  );
}
