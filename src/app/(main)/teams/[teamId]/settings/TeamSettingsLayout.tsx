'use client';
import { ReactNode } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { Grid, Column } from '@umami/react-zen';
import { SideBar } from '@/components/common/SideBar';

export function TeamSettingsLayout({ children }: { children: ReactNode }) {
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();

  const items = [
    {
      key: 'team',
      label: formatMessage(labels.team),
      url: `/teams/${teamId}/settings/team`,
    },
    {
      key: 'websites',
      label: formatMessage(labels.websites),
      url: `/teams/${teamId}/settings/websites`,
    },
    {
      key: 'members',
      label: formatMessage(labels.members),
      url: `/teams/${teamId}/settings/members`,
    },
  ].filter(n => n);

  return (
    <Grid>
      <SideBar items={items} />
      <Column>{children}</Column>
    </Grid>
  );
}
