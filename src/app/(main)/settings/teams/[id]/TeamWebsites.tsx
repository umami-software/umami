import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useApi from 'components/hooks/useApi';
import useUser from 'components/hooks/useUser';
import useCache from 'store/cache';
import WebsitesTable from '../../websites/WebsitesTable';

export function TeamWebsites({ teamId }: { teamId: string; readOnly: boolean }) {
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

  return (
    <DataTable queryResult={queryResult}>{({ data }) => <WebsitesTable data={data} />}</DataTable>
  );
}

export default TeamWebsites;
