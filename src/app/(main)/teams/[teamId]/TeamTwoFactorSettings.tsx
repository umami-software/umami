'use client';
import { Column, Row, Switch, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import {
  useMessages,
  useUpdateQuery,
  useTwoFactorStatusQuery,
  useTeamQuery,
} from '@/components/hooks';
import { useQueryClient } from '@tanstack/react-query';

export function TeamTwoFactorSettings({ teamId }: { teamId: string }) {
  const { t, labels, messages } = useMessages();
  const queryClient = useQueryClient();

  const { data: globalStatus } = useTwoFactorStatusQuery(true);
  const isGlobalRequired = globalStatus?.requiredReason === 'global';

  const { data: teamData } = useTeamQuery(teamId);
  const { mutateAsync: setTeamRequired } = useUpdateQuery(`/admin/teams/${teamId}/2fa`);

  const twoFactorRequired = !!(teamData as any)?.twoFactorRequired;

  const handleToggle = async (value: boolean) => {
    await setTeamRequired({ required: value });
    queryClient.invalidateQueries({ queryKey: ['teams', { teamId }] });
  };

  return (
    <Column gap="4">
      <Text weight="bold">{t(labels.twoFactorAuth)}</Text>

      <TooltipTrigger isDisabled={!isGlobalRequired}>
        <Row alignItems="center" gap="3">
          <Switch
            isSelected={isGlobalRequired || twoFactorRequired}
            isDisabled={isGlobalRequired}
            onChange={handleToggle}
          />
          <Text>{t(labels.twoFactorRequireTeam)}</Text>
        </Row>
        <Tooltip>{t(labels.twoFactorGlobalActiveTooltip)}</Tooltip>
      </TooltipTrigger>

      <Text size="sm" color="muted">
        {t(messages.twoFactorRequireTeamDescription)}
      </Text>
    </Column>
  );
}
