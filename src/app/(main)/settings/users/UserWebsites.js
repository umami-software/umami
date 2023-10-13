import Page from 'components/layout/Page';
import useApi from 'components/hooks/useApi';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import useApiFilter from 'components/hooks/useApiFilter';

export function UserWebsites({ userId }) {
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(
    ['user:websites', userId, filter, page, pageSize],
    () =>
      get(`/users/${userId}/websites`, {
        filter,
        page,
        pageSize,
      }),
  );
  const hasData = data && data.length !== 0;

  return (
    <Page loading={isLoading} error={error}>
      {hasData && (
        <WebsitesTable
          data={data.data}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}
    </Page>
  );
}

export default UserWebsites;
