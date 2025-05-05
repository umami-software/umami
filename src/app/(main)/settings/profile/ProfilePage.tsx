'use client';
import { ProfileSettings } from './ProfileSettings';
import { useMessages } from '@/components/hooks';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Column } from '@umami/react-zen';

export function ProfilePage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.profile)} />
      <ProfileSettings />
    </Column>
  );
}
