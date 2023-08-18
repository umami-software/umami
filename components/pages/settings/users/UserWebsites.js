import useApi from 'hooks/useApi';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useMessages from 'hooks/useMessages';
import useApiFilter from 'hooks/useApiFilter';
import Page from 'components/layout/Page';
import useConfig from 'hooks/useConfig';

export function UserWebsites({ userId }) {
  const { cloudMode } = useConfig();
  const { formatMessage, messages } = useMessages();
  const { filter,  page, pageSize, handlePageSizeChange, handleFilterChange, handlePageChange } = useApiFilter();
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['user:websites', userId, filter, page, pageSize], () =>
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
          data={data} 
          onFilterChange={handleFilterChange} 
          onPageChange={handlePageChange} 
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
          showEditButton={!cloudMode}
        />)
      }
      {!hasData && formatMessage(messages.noDataAvailable)}
    </Page>
  );
}

export default UserWebsites;
