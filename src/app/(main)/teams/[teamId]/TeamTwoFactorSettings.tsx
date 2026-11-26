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
        checked={isGlobalRequired || twoFactorRequired}
        disabled={isToggleDisabled}
        onCheckedChange={handleToggle}
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
        <Tooltip>
          <TooltipTrigger render={toggle} />
          <TooltipContent>{t(labels.twoFactorGlobalActiveTooltip)}</TooltipContent>
        </Tooltip>
      ) : (
        toggle
      )}

      <Text size="sm" color="muted">
        {t(messages.twoFactorRequireTeamDescription)}
      </Text>
    </Column>
  );
}
