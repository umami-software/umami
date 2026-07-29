'use client';
import { Column, Row, Switch, Text } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useUpdateQuery, useTwoFactorStatusQuery } from '@/components/hooks';
import { useQueryClient } from '@tanstack/react-query';

export function AdminSecurityPage() {
  const { t, labels, messages } = useMessages();
  const { data: status, isLoading } = useTwoFactorStatusQuery(true);
  const { mutateAsync: setGlobal } = useUpdateQuery('/admin/2fa/global');
  const queryClient = useQueryClient();

  const isGlobalRequired = status?.requiredReason === 'global' || false;

  const handleToggle = async (value: boolean) => {
    await setGlobal({ required: value });
    queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
  };

  if (isLoading) return null;

  return (
    <Column gap="6" margin="2">
      <PageHeader title={t(labels.security)} />
      <Panel>
        <Column gap="4">
          <Column gap="1">
            <Text weight="bold">{t(labels.twoFactorAuth)}</Text>
            <Text>{t(messages.twoFactorAdminGlobalDescription)}</Text>
          </Column>

          <Row alignItems="center" gap="3">
            <Switch isSelected={isGlobalRequired} onChange={handleToggle} />
            <Text>{t(labels.twoFactorRequireGlobal)}</Text>
          </Row>

          {isGlobalRequired && (
            <Text size="sm" color="muted">
              {t(messages.twoFactorOverrideNote)}
            </Text>
          )}
        </Column>
      </Panel>
    </Column>
  );
}
