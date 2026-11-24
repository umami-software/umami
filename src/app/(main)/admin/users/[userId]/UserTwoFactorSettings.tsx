'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Column,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Row,
  Switch,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
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
        checked={isGlobalRequired || twoFactorRequired}
        disabled={isToggleDisabled}
        onCheckedChange={handleToggle}
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

        <Text size="sm" color="muted-foreground">
          {t(messages.twoFactorRequireUserDescription)}
        </Text>

        {showConfigurationError && (
          <Text size="sm" color="muted-foreground">
            {t(messages.twoFactorErrorNotConfigured)}
          </Text>
        )}

        {isGlobalRequired ? (
          <Tooltip>
            <TooltipTrigger render={toggle} />
            <TooltipContent>{t(labels.twoFactorGlobalActiveTooltip)}</TooltipContent>
          </Tooltip>
        ) : (
          toggle
        )}

        {twoFactorEnabled && (
          <Column gap="3">
            <Text weight="bold">{t(labels.twoFactorReset)}</Text>
            <Text size="sm" color="muted-foreground">
              {t(messages.twoFactorResetDescription)}
            </Text>
            <Row>
              <Button size="sm" variant="destructive" onClick={() => setShowReset(true)}>
                {t(labels.reset)}
              </Button>
            </Row>
          </Column>
        )}
      </Column>

      <Dialog open={showReset} onOpenChange={open => !open && setShowReset(false)}>
        <DialogContent showCloseButton={false} style={{ width: 400 }}>
          <DialogHeader>
            <DialogTitle>{t(labels.twoFactorReset)}</DialogTitle>
          </DialogHeader>
          <TypeConfirmationForm
            confirmationValue={CONFIRM_VALUE}
            onConfirm={handleReset}
            onClose={() => setShowReset(false)}
            isLoading={isResetting}
            error={resetError}
            buttonLabel={t(labels.reset)}
            buttonVariant="destructive"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
