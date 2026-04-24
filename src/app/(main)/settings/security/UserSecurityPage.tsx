'use client';
import { Column, Row, Switch, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useTwoFactorStatusQuery } from '@/components/hooks';
import { TwoFactorDisableModal } from '@/components/modals/TwoFactorDisableModal';
import { TwoFactorSetupModal } from '@/components/modals/TwoFactorSetupModal';
import { useQueryClient } from '@tanstack/react-query';

export function UserSecurityPage() {
  const { t, labels, messages } = useMessages();
  const { data: status, isLoading } = useTwoFactorStatusQuery(true);
  const queryClient = useQueryClient();
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const isEnabled = status?.isEnabled ?? false;
  const isRequired = status?.isRequired ?? false;

  const handleToggle = (value: boolean) => {
    if (value) {
      setShowSetup(true);
    } else {
      setShowDisable(true);
    }
  };

  const handleSetupClose = () => {
    setShowSetup(false);
    queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
  };

  const handleDisableSuccess = () => {
    setShowDisable(false);
    queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
  };

  if (isLoading) return null;

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title={t(labels.security)} />
        <Panel>
          <Column gap="4">
            <Row alignItems="center" gap="3">
              <Text weight="bold">{t(labels.twoFactorAuth)}</Text>
              {isEnabled ? (
                <Badge variant="good">{t(labels.twoFactorActive)}</Badge>
              ) : (
                <Badge variant="gray">{t(labels.twoFactorStatusNotConfigured)}</Badge>
              )}
            </Row>

            {isEnabled ? (
              <Text>{t(messages.twoFactorActiveDescription)}</Text>
            ) : (
              <Text>{t(messages.twoFactorUserDescription)}</Text>
            )}

            <TooltipTrigger isDisabled={!(isEnabled && isRequired)}>
              <Row alignItems="center" gap="3">
                <Switch
                  isSelected={isEnabled}
                  isDisabled={isEnabled && isRequired}
                  onChange={handleToggle}
                />
                <Text>{t(labels.twoFactorEnable)}</Text>
              </Row>
              <Tooltip>{t(messages.twoFactorRequiredMessage)}</Tooltip>
            </TooltipTrigger>

            {isEnabled && isRequired && (
              <Text size="sm" color="muted">
                {t(messages.twoFactorRequiredMessage)}
              </Text>
            )}
          </Column>
        </Panel>
      </Column>

      {showSetup && <TwoFactorSetupModal required={false} onClose={handleSetupClose} />}
      {showDisable && (
        <TwoFactorDisableModal
          onClose={() => setShowDisable(false)}
          onSuccess={handleDisableSuccess}
        />
      )}
    </PageBody>
  );
}
