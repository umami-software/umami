import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { Column, DataColumn, DataTable, Row, Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { type SecurityKeyData, useMessages, useSecurityKeysQuery } from '@/components/hooks';
import { KeyRound } from '@/components/icons';
import { SecurityKeyAddButton } from './SecurityKeyAddButton';
import { SecurityKeyDeleteButton } from './SecurityKeyDeleteButton';

export function SecurityKeysPanel() {
  const { t, labels, messages } = useMessages();
  const { data, isLoading, error } = useSecurityKeysQuery();
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
  }, []);

  return (
    <Panel>
      <Column gap="4">
        <Row alignItems="center" justifyContent="space-between" gap="3">
          <Text weight="bold">{t(labels.securityKeys)}</Text>
          <SecurityKeyAddButton isDisabled={!isSupported} />
        </Row>
        <Text>{t(messages.securityKeysDescription)}</Text>
        {!isSupported && (
          <Text size="sm" color="muted">
            {t(messages.securityKeysNotSupported)}
          </Text>
        )}
        <LoadingPanel
          data={data}
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.length}
          renderEmpty={() => (
            <EmptyPlaceholder icon={<KeyRound />} description={t(messages.noSecurityKeys)} />
          )}
        >
          <DataTable data={data ?? []}>
            <DataColumn id="name" label={t(labels.name)} />
            <DataColumn id="createdAt" label={t(labels.created)}>
              {(row: SecurityKeyData) => <DateDistance date={new Date(row.createdAt)} />}
            </DataColumn>
            <DataColumn id="lastUsedAt" label={t(labels.lastUsed)}>
              {(row: SecurityKeyData) =>
                row.lastUsedAt ? (
                  <DateDistance date={new Date(row.lastUsedAt)} />
                ) : (
                  <Text color="muted">{t(labels.never)}</Text>
                )
              }
            </DataColumn>
            <DataColumn id="action" label=" " align="end" width="48px">
              {(row: SecurityKeyData) => <SecurityKeyDeleteButton keyId={row.id} name={row.name} />}
            </DataColumn>
          </DataTable>
        </LoadingPanel>
      </Column>
    </Panel>
  );
}
