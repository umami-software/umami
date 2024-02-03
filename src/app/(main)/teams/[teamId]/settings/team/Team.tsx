'use client';
import TeamEditForm from 'app/(main)/settings/teams/[teamId]/TeamEditForm';
import { useLogin, useMessages, useTeam } from 'components/hooks';
import { Loading } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';

export default function Team({ teamId }: { teamId: string }) {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const { data: team, isLoading } = useTeam(teamId);
  const allowEdit = !!team?.teamUser?.find(
    ({ userId, role }) => role === ROLES.teamOwner && userId === user.id,
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title={formatMessage(labels.team)} />
      <TeamEditForm teamId={teamId} data={team} allowEdit={allowEdit} />
    </>
  );
}
