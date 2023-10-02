'use client';
import WebsitesTable from 'app/(app)/settings/websites/WebsitesTable';
import useUser from 'components/hooks/useUser';
import useApi from 'components/hooks/useApi';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import WebsitesHeader from './WebsitesHeader';

export function Websites({
  showHeader = true,
  showEditButton = true,
  showTeam,
  includeTeams,
  onlyTeams,
}) {
  const { user } = useUser();
  const { get } = useApi();
  const filterQuery = useFilterQuery(
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
  const { getProps } = filterQuery;

  return (
    <>
      {showHeader && <WebsitesHeader />}
      <DataTable {...getProps()}>
        {({ data }) => (
          <WebsitesTable data={data} showTeam={showTeam} showEditButton={showEditButton} />
        )}
      </DataTable>
    </>
  );
}

export default Websites;
