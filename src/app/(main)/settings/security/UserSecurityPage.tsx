'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Column,
  Row,
  Switch,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { ActionForm } from '@/components/common/ActionForm';
import { ActionList } from '@/components/common/ActionList';
import { Badge } from '@/components/common/Badge';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useTwoFactorStatusQuery } from '@/components/hooks';
import { TwoFactorDisableModal } from '@/components/modals/TwoFactorDisableModal';
import { TwoFactorSetupModal } from '@/components/modals/TwoFactorSetupModal';
import { PasswordChangeButton } from './PasswordChangeButton';

export function UserSecurityPage() {
  const { t, labels, messages } = useMessages();
  const { data: status, isLoading } = useTwoFactorStatusQuery(true);
  const queryClient = useQueryClient();
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const isEnabled = status?.isEnabled ?? false;
  const isRequired = status?.isRequired ?? false;
  const isConfigured = status?.isConfigured;
  const showConfigurationError = isConfigured === false;

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
      <PageHeader title={t(labels.security)} />
      <Column gap="6">
        <ActionList>
          <ActionForm label={t(labels.password)} description={t(messages.passwordDescription)}>
            <PasswordChangeButton />
          </ActionForm>
        </ActionList>
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

            {showConfigurationError ? (
              <Text>{t(messages.twoFactorErrorNotConfigured)}</Text>
            ) : isEnabled ? (
              <Text>{t(messages.twoFactorActiveDescription)}</Text>
            ) : (
              <Text>{t(messages.twoFactorUserDescription)}</Text>
            )}

            {isConfigured === true && isEnabled && isRequired ? (
              <Tooltip>
                <TooltipTrigger render={<Row alignItems="center" gap="3" />}>
                  <Switch
                    checked={isEnabled}
                    disabled={isEnabled && isRequired}
                    onCheckedChange={handleToggle}
                  />
                  <Text>{t(labels.twoFactorEnable)}</Text>
                </TooltipTrigger>
                <TooltipContent>{t(messages.twoFactorRequiredMessage)}</TooltipContent>
              </Tooltip>
            ) : null}

            {isConfigured === true && !isEnabled ? (
              <Row alignItems="center" gap="3">
                <Switch
                  checked={isEnabled}
                  disabled={isEnabled && isRequired}
                  onCheckedChange={handleToggle}
                />
                <Text>{t(labels.twoFactorEnable)}</Text>
              </Row>
            ) : null}

            {isConfigured === true && isEnabled && !isRequired ? (
              <Row alignItems="center" gap="3">
                <Switch
                  checked={isEnabled}
                  disabled={isEnabled && isRequired}
                  onCheckedChange={handleToggle}
                />
                <Text>{t(labels.twoFactorEnable)}</Text>
              </Row>
            ) : null}

            {isConfigured === true && isEnabled && isRequired && (
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
