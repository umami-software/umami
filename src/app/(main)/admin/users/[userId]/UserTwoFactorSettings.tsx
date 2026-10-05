'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Column,
  Dialog,
  Modal,
  Row,
  Switch,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { TypeConfirmationForm } from '@/components/common/TypeConfirmationForm';
import {
  useDeleteQuery,
  useMessages,
  useTwoFactorStatusQuery,
  useTwoFactorUserStatusQuery,
  useUpdateQuery,
  useUserQuery,
} from '@/components/hooks';

const CONFIRM_VALUE = 'RESET';

export function UserTwoFactorSettings({ userId }: { userId: string }) {
  const { t, labels, messages } = useMessages();
  const queryClient = useQueryClient();
  const [showReset, setShowReset] = useState(false);

  const { data: globalStatus } = useTwoFactorStatusQuery(true);
  const isConfigured = globalStatus?.isConfigured;
  const isGlobalRequired = globalStatus?.globalRequired ?? false;
  const showConfigurationError = isConfigured === false;

  const { data: userTfaData } = useTwoFactorUserStatusQuery(userId);
  const { data: userData } = useUserQuery(userId);

  const { mutateAsync: setUserRequired } = useUpdateQuery(`/admin/users/${userId}/2fa`);
  const {
    mutateAsync: resetUserTwoFactor,
    isPending: isResetting,
    error: resetError,
  } = useDeleteQuery(`/admin/users/${userId}/2fa`);

  const twoFactorEnabled = !!(userTfaData as any)?.isEnabled;
  const twoFactorRequired = !!(userData as any)?.twoFactorRequired;

  const handleToggle = async (value: boolean) => {
    await setUserRequired({ required: value });
    queryClient.invalidateQueries({ queryKey: ['users', { userId }] });
  };

  const isToggleDisabled = isGlobalRequired || (!isConfigured && !twoFactorRequired);
  const toggle = (
    <Row alignItems="center" gap="3">
      <Switch
        isSelected={isGlobalRequired || twoFactorRequired}
        isDisabled={isToggleDisabled}
        onChange={handleToggle}
      />
      <Text>{t(labels.twoFactorRequireUser)}</Text>
    </Row>
  );

  const handleReset = async () => {
    await resetUserTwoFactor(null, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['user-2fa-status', userId] });
        setShowReset(false);
      },
    });
  };

  return (
    <>
      <Column gap="6">
        <Row alignItems="center" gap="3">
          <Text weight="bold">{t(labels.twoFactorAuth)}</Text>
          <Badge variant={twoFactorEnabled ? 'good' : 'gray'}>
            {twoFactorEnabled ? t(labels.twoFactorActive) : t(labels.twoFactorStatusNotConfigured)}
          </Badge>
        </Row>

        <Text size="sm" color="muted">
          {t(messages.twoFactorRequireUserDescription)}
        </Text>

        {showConfigurationError && (
          <Text size="sm" color="muted">
            {t(messages.twoFactorErrorNotConfigured)}
          </Text>
        )}

        {isGlobalRequired ? (
          <TooltipTrigger>
            {toggle}
            <Tooltip>{t(labels.twoFactorGlobalActiveTooltip)}</Tooltip>
          </TooltipTrigger>
        ) : (
          toggle
        )}

        {twoFactorEnabled && (
          <Column gap="3">
            <Text weight="bold">{t(labels.twoFactorReset)}</Text>
            <Text size="sm" color="muted">
              {t(messages.twoFactorResetDescription)}
            </Text>
            <Row>
              <Button size="sm" variant="danger" onPress={() => setShowReset(true)}>
                {t(labels.reset)}
              </Button>
            </Row>
          </Column>
        )}
      </Column>

      <ControlledDialog>
        <Modal isOpen={showReset} onOpenChange={open => !open && setShowReset(false)}>
          <Dialog title={t(labels.twoFactorReset)} style={{ width: 400 }}>
            <TypeConfirmationForm
              confirmationValue={CONFIRM_VALUE}
              onConfirm={handleReset}
              onClose={() => setShowReset(false)}
              isLoading={isResetting}
              error={resetError}
              buttonLabel={t(labels.reset)}
              buttonVariant="danger"
            />
          </Dialog>
        </Modal>
      </ControlledDialog>
    </>
  );
}
