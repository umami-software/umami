import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import useApi from 'components/hooks/useApi';
import useUser from 'components/hooks/useUser';
import useCache from 'store/cache';

export function TeamWebsites({ teamId }: { teamId: string; readOnly: boolean }) {
  const { get } = useApi();
  const { user } = useUser();
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
