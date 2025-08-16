'use client';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { PreferenceSettings } from './PreferenceSettings';
import { PageHeader } from '@/components/common/PageHeader';
import { PageBody } from '@/components/common/PageBody';

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
