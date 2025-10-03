import { useLinksQuery, useNavigation } from '@/components/hooks';
import { LinksTable } from './LinksTable';
import { DataGrid } from '@/components/common/DataGrid';

export function LinksDataTable() {
  const { teamId } = useNavigation();
  const query = useLinksQuery({ teamId });

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <LinksTable data={data} />}
    </DataGrid>
  );
}
