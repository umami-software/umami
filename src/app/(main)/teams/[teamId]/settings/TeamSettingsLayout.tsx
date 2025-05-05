'use client';
import { ReactNode } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { Grid, Column } from '@umami/react-zen';
import { SideMenu } from '@/components/common/SideMenu';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/common/PageHeader';

export function TeamSettingsLayout({ children }: { children: ReactNode }) {
  const { formatMessage, labels } = useMessages();
  const { pathname, teamId } = useNavigation();

  const items = [
    {
      id: 'team',
      label: formatMessage(labels.team),
      url: `/teams/${teamId}/settings/team`,
    },
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      url: `/teams/${teamId}/settings/websites`,
    },
    {
      id: 'members',
      label: formatMessage(labels.members),
      url: `/teams/${teamId}/settings/members`,
    },
  ].filter(n => n);

  const value = items.find(({ url }) => pathname.includes(url))?.id;

  return (
    <Column gap="6">
      <PageHeader title={formatMessage(labels.teamSettings)} />
      <Column gap="6">
        <Grid columns="200px 1fr">
          <Column marginTop="6">
            <SideMenu items={items} selectedKey={value} />
          </Column>
          <Column>
            <Panel>{children}</Panel>
          </Column>
        </Grid>
      </Column>
    </Column>
  );
}
