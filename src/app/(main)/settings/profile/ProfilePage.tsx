'use client';
import { ProfileSettings } from './ProfileSettings';
import { useMessages } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';

export function ProfilePage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6">
      <PageHeader title={formatMessage(labels.profile)} />
      <Panel>
        <ProfileSettings />
      </Panel>
    </Column>
  );
}
