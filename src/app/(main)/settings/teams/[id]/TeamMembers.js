import useApi from 'components/hooks/useApi';
import TeamMembersTable from './TeamMembersTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';

export function TeamMembers({ teamId, readOnly }) {
  const { get } = useApi();
  const queryResult = useFilterQuery(
    ['team:users', teamId],
    params => {
      return get(`/teams/${teamId}/users`, {
        ...params,
      });
    },
    { enabled: !!teamId },
  );

  return (
    <>
      <DataTable queryResult={queryResult}>
        {({ data }) => <TeamMembersTable data={data} readOnly={readOnly} />}
      </DataTable>
    </>
  );
}

export default TeamMembers;
