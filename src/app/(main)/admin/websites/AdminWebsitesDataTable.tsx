import { DataGrid } from '@/components/common/DataGrid';
import { useWebsitesQuery } from '@/components/hooks';
import { AdminWebsitesTable } from './AdminWebsitesTable';

export function AdminWebsitesDataTable() {
  const query = useWebsitesQuery();

  return (
    <DataGrid query={query} allowSearch={true}>
      {props => <AdminWebsitesTable {...props} />}
    </DataGrid>
  );
}
