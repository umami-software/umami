'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useConfig, useMessages } from '@/components/hooks';
import { ApiKeyAddButton } from './ApiKeyAddButton';
import { ApiKeysTable } from './ApiKeysTable';

export function ApiKeysPage() {
  const { t, labels } = useMessages();
  const { cloudMode } = useConfig();

  if (cloudMode) {
    return null;
  }

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={t(labels.apiKeys)}>
          <ApiKeyAddButton />
        </PageHeader>
        <Panel>
          <ApiKeysTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
