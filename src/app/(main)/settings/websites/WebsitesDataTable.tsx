import { ReactNode } from 'react';
import WebsitesTable from 'app/(main)/settings/websites/WebsitesTable';
import DataTable from 'components/common/DataTable';
import { useWebsites } from 'components/hooks';

export function WebsitesDataTable({
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
  children,
}: {
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useWebsites({ teamId });

  if (queryResult?.result?.data?.length === 0) {
    return children;
  }

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => (
        <WebsitesTable
          teamId={teamId}
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
        />
      )}
    </DataTable>
  );
}

export default WebsitesDataTable;
