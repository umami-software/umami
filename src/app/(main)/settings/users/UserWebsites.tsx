import Page from 'components/layout/Page';
import useApi from 'components/hooks/useApi';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';

export function UserWebsites({ userId }) {
  const { get } = useApi();
  const queryResult = useFilterQuery({
    queryKey: ['user:websites', userId],
    queryFn: (params: any) => get(`/users/${userId}/websites`, params),
  });
  const hasData = queryResult.result && queryResult.result.data.length !== 0;

  return (
    <Page isLoading={queryResult.query.isLoading} error={queryResult.query.error}>
      {hasData && (
        <DataTable queryResult={queryResult}>
          {({ data }) => <WebsitesTable data={data} />}
        </DataTable>
      )}
    </Page>
  );
}

export default UserWebsites;
