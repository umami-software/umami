import { DataGrid } from '@/components/common/DataGrid';
import { useTeamWebsites } from '@/components/hooks';
import { TeamWebsitesTable } from './TeamWebsitesTable';

export function TeamWebsitesDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamWebsites(teamId);

  return (
    <DataGrid queryResult={queryResult}>
      {({ data }) => <TeamWebsitesTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
