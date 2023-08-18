import useApi from 'hooks/useApi';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useMessages from 'hooks/useMessages';
import useApiFilter from 'hooks/useApiFilter';

export function UserWebsites({ userId }) {
  const { formatMessage, messages } = useMessages();
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['user:websites', userId, filter, page, pageSize], () =>
    get(`/users/${userId}/websites`, {
      filter,
      page,
      pageSize,
    }),
  );
  const hasData = data && data.length !== 0;

  return (
    <div>
      {hasData && (
        <WebsitesTable
          data={data}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}
      {!hasData && formatMessage(messages.noDataAvailable)}
    </div>
  );
}

export default UserWebsites;
