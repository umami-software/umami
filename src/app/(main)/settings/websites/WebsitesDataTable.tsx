import { ReactNode } from 'react';
import WebsitesTable from '@/app/(main)/settings/websites/WebsitesTable';
import DataTable from '@/components/common/DataTable';
import { useWebsites, useModified } from '@/components/hooks';
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
  const { touch } = useModified('websites');
  return (
    <DataTable queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => (
        <WebsitesTable
          teamId={teamId}
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
          updateChildren={() => touch()}
        />
      )}
    </DataTable>
  );
}

export default WebsitesDataTable;
