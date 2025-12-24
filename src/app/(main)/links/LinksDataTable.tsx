import { DataGrid } from '@/components/common/DataGrid';
import { useLinksQuery, useNavigation } from '@/components/hooks';
import { LinksTable } from './LinksTable';

export function LinksDataTable() {
  const { teamId } = useNavigation();
  const query = useLinksQuery({ teamId });

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <LinksTable data={data} />}
    </DataGrid>
  );
}
