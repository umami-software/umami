'use client';
import TeamMembersDataTable from './TeamMembersDataTable';
import PageHeader from 'components/layout/PageHeader';
import { useMessages } from 'components/hooks';

export function TeamMembers({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <PageHeader title={formatMessage(labels.members)} />
      <TeamMembersDataTable teamId={teamId} allowEdit={true} />
    </>
  );
}

export default TeamMembers;
