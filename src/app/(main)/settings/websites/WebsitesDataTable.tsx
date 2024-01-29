'use client';
import { ReactNode } from 'react';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import DataTable from 'components/common/DataTable';
import { useWebsites } from 'components/hooks';

export function WebsitesDataTable({
  userId,
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
  children,
}: {
  userId?: string;
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useWebsites({ userId, teamId });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable
          teamId={teamId}
          data={data}
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
