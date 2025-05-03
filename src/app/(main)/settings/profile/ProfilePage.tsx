'use client';
import { ProfileSettings } from './ProfileSettings';
import { useMessages } from '@/components/hooks';
import { SectionHeader } from '@/components/common/SectionHeader';

export function ProfilePage() {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <SectionHeader title={formatMessage(labels.profile)} />

      <ProfileSettings />
    </>
  );
}
