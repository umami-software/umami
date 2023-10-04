'use client';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import useUser from 'components/hooks/useUser';
import useApi from 'components/hooks/useApi';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import WebsitesHeader from './WebsitesHeader';

function useWebsites({ includeTeams, onlyTeams }) {
  const { user } = useUser();
  const { get } = useApi();
  return useFilterQuery(
    ['websites', { includeTeams, onlyTeams }],
    params => {
      return get(`/users/${user?.id}/websites`, {
        includeTeams,
        onlyTeams,
        ...params,
      });
    },
    { enabled: !!user },
  );
}

export function WebsitesDataTable({
  showHeader = true,
  showEditButton = true,
  showViewButton = true,
  showActions = true,
  showTeam,
  includeTeams,
  onlyTeams,
  children,
}) {
  const queryResult = useWebsites({ includeTeams, onlyTeams });

  return (
    <>
      {showHeader && <WebsitesHeader />}
      <DataTable queryResult={queryResult}>
        {({ data }) => (
          <WebsitesTable
            data={data}
            showTeam={showTeam}
            showActions={showActions}
            showEditButton={showEditButton}
            showViewButton={showViewButton}
          >
            {children}
          </WebsitesTable>
        )}
      </DataTable>
    </>
  );
}

export default WebsitesDataTable;
