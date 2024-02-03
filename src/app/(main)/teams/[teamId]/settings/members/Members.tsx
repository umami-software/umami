'use client';
import TeamMembers from 'app/(main)/settings/teams/[teamId]/TeamMembers';
import PageHeader from 'components/layout/PageHeader';
import { useMessages } from 'components/hooks';

export default function ({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <PageHeader title={formatMessage(labels.members)} />
      <TeamMembers teamId={teamId} allowEdit={true} />
    </>
  );
}
