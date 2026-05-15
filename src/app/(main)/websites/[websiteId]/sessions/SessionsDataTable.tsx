import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);
  const { updateParams } = useNavigation();

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => (
        <SessionsTable
          data={data}
          websiteId={websiteId}
          getSessionHref={row => updateParams({ session: row.id })}
        />
      )}
    </DataGrid>
  );
}
