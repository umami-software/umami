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
  const isConfigured = globalStatus?.isConfigured;
  const isGlobalRequired = globalStatus?.globalRequired ?? false;
  const showConfigurationError = isConfigured === false;

  const { data: teamData } = useTeamQuery(teamId);
  const { mutateAsync: setTeamRequired } = useUpdateQuery(`/admin/teams/${teamId}/2fa`);

  const twoFactorRequired = !!(teamData as any)?.twoFactorRequired;

  const handleToggle = async (value: boolean) => {
    await setTeamRequired({ required: value });
    queryClient.invalidateQueries({ queryKey: ['teams', { teamId }] });
  };

  const isToggleDisabled = isGlobalRequired || (!isConfigured && !twoFactorRequired);
  const toggle = (
    <Row alignItems="center" gap="3">
      <Switch
        isSelected={isGlobalRequired || twoFactorRequired}
        isDisabled={isToggleDisabled}
        onChange={handleToggle}
      />
      <Text>{t(labels.twoFactorRequireTeam)}</Text>
    </Row>
  );

  return (
    <Column gap="4">
      <Text weight="bold">{t(labels.twoFactorAuth)}</Text>

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

      <Text size="sm" color="muted">
        {t(messages.twoFactorRequireTeamDescription)}
      </Text>
    </Column>
  );
}
