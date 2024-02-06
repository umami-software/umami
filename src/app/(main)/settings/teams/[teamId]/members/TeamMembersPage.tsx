'use client';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';
import TeamMembersDataTable from './TeamMembersDataTable';
import PageHeader from 'components/layout/PageHeader';
import { useMessages } from 'components/hooks';

export function TeamMembersPage({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <TeamProvider teamId={teamId}>
      <PageHeader title={formatMessage(labels.members)} />
      <TeamMembersDataTable teamId={teamId} allowEdit={true} />
    </TeamProvider>
  );
}

export default TeamMembersPage;
