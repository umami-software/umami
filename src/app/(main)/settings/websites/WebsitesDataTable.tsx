'use client';
import { ReactNode } from 'react';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import useApi from 'components/hooks/useApi';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import useCache from 'store/cache';

export interface WebsitesDataTableProps {
  userId: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
  showTeam?: boolean;
  includeTeams?: boolean;
  onlyTeams?: boolean;
  children?: ReactNode;
}

function useWebsites(userId: string, { includeTeams, onlyTeams }) {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.websites);

  return useFilterQuery({
    queryKey: ['websites', { includeTeams, onlyTeams, modified }],
    queryFn: (params: any) => {
      return get(`/users/${userId}/websites`, {
        includeTeams,
        onlyTeams,
        ...params,
      });
    },
    enabled: !!userId,
  });
}

export function WebsitesDataTable({
  userId,
  allowEdit = true,
  allowView = true,
  showActions = true,
  showTeam,
  includeTeams,
  onlyTeams,
  children,
}: WebsitesDataTableProps) {
  const queryResult = useWebsites(userId, { includeTeams, onlyTeams });

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
