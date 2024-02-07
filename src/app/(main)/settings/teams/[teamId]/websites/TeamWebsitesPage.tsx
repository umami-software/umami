'use client';
import TeamWebsitesDataTable from './TeamWebsitesDataTable';
import PageHeader from 'components/layout/PageHeader';
import { useMessages } from 'components/hooks';

export function TeamWebsitesPage({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <PageHeader title={formatMessage(labels.websites)} />
      <TeamWebsitesDataTable teamId={teamId} allowEdit={true} />
    </>
  );
}

export default TeamWebsitesPage;
