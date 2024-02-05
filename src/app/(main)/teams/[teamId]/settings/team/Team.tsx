'use client';
import { useContext } from 'react';
import { useLogin, useMessages } from 'components/hooks';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import TeamEditForm from 'app/(main)/settings/teams/[teamId]/TeamEditForm';
import { TeamContext } from 'app/(main)/teams/[teamId]/TeamProvider';

export default function Team({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const allowEdit = !!team?.teamUser?.find(
    ({ userId, role }) => role === ROLES.teamOwner && userId === user.id,
  );

  return (
    <>
      <PageHeader title={formatMessage(labels.team)} />
      <TeamEditForm teamId={teamId} allowEdit={allowEdit} />
    </>
  );
}
