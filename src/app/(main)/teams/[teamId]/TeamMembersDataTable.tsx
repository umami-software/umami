import { DataGrid } from '@/components/common/DataGrid';
import { useTeamMembersQuery } from '@/components/hooks';
import { TeamMembersTable } from './TeamMembersTable';

export function TeamMembersDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamMembersQuery(teamId);

  return (
    <DataGrid query={queryResult} allowSearch>
      {({ data }) => <TeamMembersTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
