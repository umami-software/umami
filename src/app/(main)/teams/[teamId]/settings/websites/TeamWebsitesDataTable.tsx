import DataTable from '@/components/common/DataTable';
import { useTeamWebsites } from '@/components/hooks';
import TeamWebsitesTable from './TeamWebsitesTable';

export function TeamWebsitesDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamWebsites(teamId);

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <TeamWebsitesTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataTable>
  );
}

export default TeamWebsitesDataTable;
