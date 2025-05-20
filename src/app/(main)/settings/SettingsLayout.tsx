'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { SideMenu } from '@/components/common/SideMenu';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';

export function SettingsLayout({ children }: { children: ReactNode }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();

  const items = [
    {
      id: 'profile',
      label: formatMessage(labels.profile),
      url: '/settings/profile',
    },
    { id: 'teams', label: formatMessage(labels.teams), url: '/settings/teams' },
    user.isAdmin && {
      id: 'websites',
      label: formatMessage(labels.websites),
      url: '/settings/websites',
    },
    user.isAdmin && {
      id: 'users',
      label: formatMessage(labels.users),
      url: '/settings/users',
    },
  ].filter(n => n);

  const value = items.find(({ url }) => pathname.includes(url))?.id;

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={formatMessage(labels.settings)} />
        <Grid columns="160px 1fr" gap>
          <Column>
            <SideMenu items={items} selectedKey={value} />
          </Column>
          <Column>
            <Panel>{children}</Panel>
          </Column>
        </Grid>
      </Column>
    </PageBody>
  );
}
