'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { ProfileSettings } from './ProfileSettings';

export function ProfilePage() {
  const { t, labels } = useMessages();

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={t(labels.profile)} />
        <Panel>
          <ProfileSettings />
        </Panel>
      </Column>
    </PageBody>
  );
}
