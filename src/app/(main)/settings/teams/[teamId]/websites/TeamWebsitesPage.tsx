'use client';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';
import TeamWebsitesDataTable from './TeamWebsitesDataTable';
import PageHeader from 'components/layout/PageHeader';
import { useMessages } from 'components/hooks';

export function TeamWebsitesPage({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <TeamProvider teamId={teamId}>
      <PageHeader title={formatMessage(labels.websites)} />
      <TeamWebsitesDataTable teamId={teamId} allowEdit={true} />
    </TeamProvider>
  );
}

export default TeamWebsitesPage;
