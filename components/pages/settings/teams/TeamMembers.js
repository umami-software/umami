import { Loading, useToasts } from 'react-basics';
import TeamMembersTable from 'components/pages/settings/teams/TeamMembersTable';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';
import useApiFilter from 'hooks/useApiFilter';

export function TeamMembers({ teamId, readOnly }) {
  const { showToast } = useToasts();
  const { formatMessage, messages } = useMessages();
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const { get, useQuery } = useApi();
  const { data, isLoading, refetch } = useQuery(
    ['teams:users', teamId, filter, page, pageSize],
    () =>
      get(`/teams/${teamId}/users`, {
        filter,
        page,
        pageSize,
      }),
  );

  if (isLoading) {
    return <Loading icon="dots" style={{ minHeight: 300 }} />;
  }

  const handleSave = async () => {
    await refetch();
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
      <TeamMembersTable
        onSave={handleSave}
        data={data}
        readOnly={readOnly}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        filterValue={filter}
      />
    </>
  );
}

export default TeamMembers;
