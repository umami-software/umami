import useApi from 'components/hooks/useApi';
import TeamMembersTable from './TeamMembersTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useCache from 'store/cache';

export function TeamMembers({ teamId, readOnly }) {
  const { get } = useApi();
  const modified = useCache(state => state?.['team:members']);
  const queryResult = useFilterQuery(
    ['team:members', { teamId, modified }],
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
        {({ data }) => <TeamMembersTable data={data} teamId={teamId} readOnly={readOnly} />}
      </DataTable>
    </>
  );
}

export default TeamMembers;
