'use client';
import { TeamMembersDataTable } from './TeamMembersDataTable';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useLoginQuery, useMessages, useTeam } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { Column } from '@umami/react-zen';

export function TeamMembersPage({ teamId }: { teamId: string }) {
  const team = useTeam();
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  const canEdit =
    team?.members?.find(
      ({ userId, role }) =>
        (role === ROLES.teamOwner || role === ROLES.teamManager) && userId === user.id,
    ) && user.role !== ROLES.viewOnly;

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.members)} />
      <TeamMembersDataTable teamId={teamId} allowEdit={canEdit} />
    </Column>
  );
}
