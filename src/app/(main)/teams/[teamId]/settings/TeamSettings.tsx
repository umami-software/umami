'use client';
import { ReactNode } from 'react';
import SettingsLayout from 'components/layout/SettingsLayout';
import { useMessages } from 'components/hooks';

export default function ({ children, teamId }: { children: ReactNode; teamId: string }) {
  const { formatMessage, labels } = useMessages();

  const items = [
    {
      key: 'team',
      label: formatMessage(labels.team),
      url: `/teams/${teamId}/settings/team`,
    },
    {
      key: 'members',
      label: formatMessage(labels.members),
      url: `/teams/${teamId}/settings/members`,
    },
    {
      key: 'websites',
      label: formatMessage(labels.websites),
      url: `/teams/${teamId}/settings/websites`,
    },
  ].filter(n => n);

  return <SettingsLayout items={items}>{children}</SettingsLayout>;
}
