'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { PreferenceSettings } from './PreferenceSettings';

export function PreferencesPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={formatMessage(labels.preferences)} />
        <Panel>
          <PreferenceSettings />
        </Panel>
      </Column>
    </PageBody>
  );
}
