'use client';
import { TeamContext } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { TeamMembersDataTable } from './TeamMembersDataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { useContext } from 'react';

export function TeamMembersPage({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  const canEdit =
    team?.teamUser?.find(
      ({ userId, role }) =>
        (role === ROLES.teamOwner || role === ROLES.teamManager) && userId === user.id,
    ) && user.role !== ROLES.viewOnly;

  return (
    <>
      <PageHeader title={formatMessage(labels.members)} />
      <TeamMembersDataTable teamId={teamId} allowEdit={canEdit} />
    </>
  );
}
