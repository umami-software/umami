import { ReactNode } from 'react';
import { WebsitesTable } from '@/app/(main)/settings/websites/WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useWebsites } from '@/components/hooks';

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

  return (
    <DataGrid queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => (
        <WebsitesTable
          teamId={teamId}
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
        />
      )}
    </DataGrid>
  );
}
