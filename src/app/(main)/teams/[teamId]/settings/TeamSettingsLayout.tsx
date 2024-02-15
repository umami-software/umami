'use client';
import { ReactNode } from 'react';
import MenuLayout from 'components/layout/MenuLayout';
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
