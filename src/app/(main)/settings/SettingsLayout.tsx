'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { SideMenu } from '@/components/common/SideMenu';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';

export function SettingsLayout({ children }: { children: ReactNode }) {
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();

  const items = [
    {
      id: 'preferences',
      label: formatMessage(labels.preferences),
      url: '/settings/preferences',
    },
    {
      id: 'profile',
      label: formatMessage(labels.profile),
      url: '/settings/profile',
    },
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      url: '/settings/websites',
    },
    { id: 'teams', label: formatMessage(labels.teams), url: '/settings/teams' },
  ];

  const value = items.find(({ url }) => pathname.includes(url))?.id;

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={formatMessage(labels.settings)} />
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
