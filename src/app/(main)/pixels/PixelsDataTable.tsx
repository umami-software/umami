import { usePixelsQuery, useNavigation } from '@/components/hooks';
import { PixelsTable } from './PixelsTable';
import { DataGrid } from '@/components/common/DataGrid';

export function PixelsDataTable() {
  const { teamId } = useNavigation();
  const query = usePixelsQuery({ teamId });

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <PixelsTable data={data} />}
    </DataGrid>
  );
}
