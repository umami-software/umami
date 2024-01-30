import DataTable from 'components/common/DataTable';
import TeamMembersTable from './TeamMembersTable';
import useTeamMembers from 'components/hooks/queries/useTeamMembers';

export function TeamMembers({ teamId, allowEdit }: { teamId: string; allowEdit: boolean }) {
  const queryResult = useTeamMembers(teamId);

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <TeamMembersTable data={data} teamId={teamId} allowEdit={allowEdit} />}
    </DataTable>
  );
}

export default TeamMembers;
