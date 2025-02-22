'use client';
import { ReactNode } from 'react';
import { useMessages, useTeamUrl } from '@/components/hooks';
import MenuLayout from '@/components/layout/MenuLayout';

export default function TeamSettingsLayout({ children }: { children: ReactNode }) {
  const { formatMessage, labels } = useMessages();
  const { teamId } = useTeamUrl();

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

  return <MenuLayout items={items}>{children}</MenuLayout>;
}
