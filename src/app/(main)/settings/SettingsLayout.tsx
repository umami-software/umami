'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { SideBar } from '@/components/common/SideBar';

export function SettingsLayout({ children }: { children: ReactNode }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  const items = [
    {
      key: 'websites',
      label: formatMessage(labels.websites),
      url: '/settings/websites',
    },
    { key: 'teams', label: formatMessage(labels.teams), url: '/settings/teams' },
    user.isAdmin && {
      key: 'users',
      label: formatMessage(labels.users),
      url: '/settings/users',
    },
  ].filter(n => n);

  return (
    <Grid>
      <SideBar items={items} />
      <Column>{children}</Column>
    </Grid>
  );
}
