'use client';
import { useQueryClient } from '@tanstack/react-query';
import { Column, Row, Switch, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import {
  useMessages,
  useTeamQuery,
  useTwoFactorStatusQuery,
  useUpdateQuery,
} from '@/components/hooks';

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

      {isGlobalRequired ? (
        <TooltipTrigger>
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
      ) : (
        <Row alignItems="center" gap="3">
          <Switch
            isSelected={isGlobalRequired || twoFactorRequired}
            isDisabled={isGlobalRequired}
            onChange={handleToggle}
          />
          <Text>{t(labels.twoFactorRequireTeam)}</Text>
        </Row>
      )}

      <Text size="sm" color="muted">
        {t(messages.twoFactorRequireTeamDescription)}
      </Text>
    </Column>
  );
}
