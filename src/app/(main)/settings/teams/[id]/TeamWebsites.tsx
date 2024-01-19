import TeamWebsitesTable from './TeamWebsitesTable';
import useApi from 'components/hooks/useApi';
import useUser from 'components/hooks/useUser';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useCache from 'store/cache';

export function TeamWebsites({ teamId, readOnly }: { teamId: string; readOnly: boolean }) {
  const { user } = useUser();
  const { get } = useApi();
  const modified = useCache(state => state?.['team:websites']);
  const queryResult = useFilterQuery({
    queryKey: ['team:websites', { teamId, modified }],
    queryFn: params => {
      return get(`/teams/${teamId}/websites`, {
        ...params,
      });
    },
    enabled: !!user,
  });

  const handleChange = () => {
    queryResult.query.refetch();
  };

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <TeamWebsitesTable data={data} onRemove={handleChange} readOnly={readOnly} />}
    </DataTable>
  );
}

export default TeamWebsites;
