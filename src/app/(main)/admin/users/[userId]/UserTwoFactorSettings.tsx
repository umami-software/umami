'use client';
import { Column, Row, Switch, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { Badge } from '@/components/common/Badge';
import {
  useMessages,
  useUpdateQuery,
  useTwoFactorStatusQuery,
  useUserQuery,
  useTwoFactorUserStatusQuery,
} from '@/components/hooks';
import { useQueryClient } from '@tanstack/react-query';

export function UserTwoFactorSettings({ userId }: { userId: string }) {
  const { t, labels, messages } = useMessages();
  const queryClient = useQueryClient();

  const { data: globalStatus } = useTwoFactorStatusQuery(true);
  const isGlobalRequired = globalStatus?.requiredReason === 'global';

  const { data: userTfaData } = useTwoFactorUserStatusQuery(userId);
  const { data: userData } = useUserQuery(userId);

  const { mutateAsync: setUserRequired } = useUpdateQuery(`/admin/users/${userId}/2fa`);

  const twoFactorEnabled = !!(userTfaData as any)?.isEnabled;
  const twoFactorRequired = !!(userData as any)?.twoFactorRequired;

  const handleToggle = async (value: boolean) => {
    await setUserRequired({ required: value });
    queryClient.invalidateQueries({ queryKey: ['users', { userId }] });
  };

  return (
    <Column gap="4">
      <Row alignItems="center" gap="3">
        <Text weight="bold">{t(labels.twoFactorAuth)}</Text>
        <Badge variant={twoFactorEnabled ? 'good' : 'gray'}>
          {twoFactorEnabled ? t(labels.twoFactorActive) : t(labels.twoFactorStatusNotConfigured)}
        </Badge>
      </Row>

      <Text size="sm" color="muted">
        {t(messages.twoFactorRequireUserDescription)}
      </Text>

      <TooltipTrigger isDisabled={!isGlobalRequired}>
        <Row alignItems="center" gap="3">
          <Switch
            isSelected={isGlobalRequired || twoFactorRequired}
            isDisabled={isGlobalRequired}
            onChange={handleToggle}
          />
          <Text>{t(labels.twoFactorRequireUser)}</Text>
        </Row>
        <Tooltip>{t(labels.twoFactorGlobalActiveTooltip)}</Tooltip>
      </TooltipTrigger>
    </Column>
  );
}
