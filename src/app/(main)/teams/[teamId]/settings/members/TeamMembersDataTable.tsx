import DataTable from '@/components/common/DataTable';
import TeamMembersTable from './TeamMembersTable';
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
    <DataTable queryResult={queryResult}>
      {({ data }) => <TeamMembersTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataTable>
  );
}

export default TeamMembersDataTable;
