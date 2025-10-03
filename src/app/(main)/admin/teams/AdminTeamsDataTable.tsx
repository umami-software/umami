import { DataGrid } from '@/components/common/DataGrid';
import { useTeamsQuery } from '@/components/hooks';
import { AdminTeamsTable } from './AdminTeamsTable';
import { ReactNode } from 'react';

export function AdminTeamsDataTable({
  showActions,
}: {
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useTeamsQuery();

  return (
    <DataGrid query={queryResult} allowSearch={true}>
      {({ data }) => <AdminTeamsTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
