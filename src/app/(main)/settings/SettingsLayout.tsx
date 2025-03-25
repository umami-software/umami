'use client';
import { ReactNode } from 'react';
import { useLogin, useMessages } from '@/components/hooks';
import MenuLayout from '@/components/layout/MenuLayout';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const { user } = useLogin();
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

  return <MenuLayout items={items}>{children}</MenuLayout>;
}
