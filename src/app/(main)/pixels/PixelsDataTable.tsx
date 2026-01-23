import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, usePixelsQuery } from '@/components/hooks';
import { PixelsTable } from './PixelsTable';

export function PixelsDataTable() {
  const { teamId } = useNavigation();
  const query = usePixelsQuery({ teamId });

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <PixelsTable data={data} />}
    </DataGrid>
  );
}
