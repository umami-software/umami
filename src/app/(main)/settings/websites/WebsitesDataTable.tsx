'use client';
import { ReactNode } from 'react';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import useUser from 'components/hooks/useUser';
import useApi from 'components/hooks/useApi';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import useCache from 'store/cache';

export interface WebsitesDataTableProps {
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
  showTeam?: boolean;
  includeTeams?: boolean;
  onlyTeams?: boolean;
  children?: ReactNode;
}

function useWebsites({ includeTeams, onlyTeams }) {
  const { user } = useUser();
  const { get } = useApi();
  const modified = useCache((state: any) => state?.websites);

  return useFilterQuery(
    ['websites', { includeTeams, onlyTeams, modified }],
    (params: any) => {
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
  allowEdit = true,
  allowView = true,
  showActions = true,
  showTeam,
  includeTeams,
  onlyTeams,
  children,
}: WebsitesDataTableProps) {
  const queryResult = useWebsites({ includeTeams, onlyTeams });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable
          data={data}
          showTeam={showTeam}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
        >
          {children}
        </WebsitesTable>
      )}
    </DataTable>
  );
}

export default WebsitesDataTable;
