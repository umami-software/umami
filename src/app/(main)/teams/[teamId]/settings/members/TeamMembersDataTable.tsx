import { DataGrid } from '@/components/common/DataGrid';
import { TeamMembersTable } from './TeamMembersTable';
import { useTeamMembers } from '@/components/hooks';

export function TeamMembersDataTable({
  teamId,
  allowEdit = false,
}: {
  teamId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useTeamMembers(teamId);

  return (
    <DataGrid queryResult={queryResult}>
      {({ data }) => <TeamMembersTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
