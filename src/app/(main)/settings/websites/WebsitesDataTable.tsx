import { WebsitesTable } from './WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useWebsitesQuery } from '@/components/hooks';

export function WebsitesDataTable({
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
}: {
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
}) {
  const queryResult = useWebsitesQuery({ teamId });

  return (
    <DataGrid queryResult={queryResult} allowSearch allowPaging>
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
