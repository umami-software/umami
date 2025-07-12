import { DataGrid } from '@/components/common/DataGrid';
import { useTeamWebsitesQuery } from '@/components/hooks';
import { TeamWebsitesTable } from './TeamWebsitesTable';

export function TeamWebsitesDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamWebsitesQuery(teamId);

  return (
    <DataGrid query={queryResult} allowSearch>
      {({ data }) => <TeamWebsitesTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
