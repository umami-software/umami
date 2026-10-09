import { DataColumn, DataTable, Text } from '@umami/react-zen';
import { DateDistance } from '@/components/common/DateDistance';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { type ApiKeyData, useApiKeysQuery, useMessages } from '@/components/hooks';
import { KeyRound } from '@/components/icons';
import { ApiKeyDeleteButton } from './ApiKeyDeleteButton';

export function ApiKeysTable() {
  const { t, labels, messages } = useMessages();
  const { data, isLoading, error } = useApiKeysQuery();

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      error={error}
      isEmpty={!data?.length}
      renderEmpty={() => (
        <EmptyPlaceholder icon={<KeyRound />} description={t(messages.noApiKeys)} />
      )}
    >
      <DataTable data={data ?? []}>
        <DataColumn id="name" label={t(labels.name)} />
        <DataColumn id="keyPrefix" label={t(labels.apiKey)}>
          {(row: ApiKeyData) => <code>{row.keyPrefix}…</code>}
        </DataColumn>
        <DataColumn id="createdAt" label={t(labels.created)}>
          {(row: ApiKeyData) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        <DataColumn id="lastUsedAt" label={t(labels.lastUsed)}>
          {(row: ApiKeyData) =>
            row.lastUsedAt ? (
              <DateDistance date={new Date(row.lastUsedAt)} />
            ) : (
              <Text color="muted">{t(labels.never)}</Text>
            )
          }
        </DataColumn>
        <DataColumn id="action" label=" " align="end" width="48px">
          {(row: ApiKeyData) => <ApiKeyDeleteButton keyId={row.id} name={row.name} />}
        </DataColumn>
      </DataTable>
    </LoadingPanel>
  );
}
