import { DataGrid } from '@/components/common/DataGrid';
import { useNavigation, useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionFilterButton } from './SessionFilterButton';
import { SessionsTable } from './SessionsTable';

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const { query, updateParams } = useNavigation();
  const minDuration =
    typeof query.minDuration === 'string' && /^\d+$/.test(query.minDuration)
      ? query.minDuration
      : '0';
  const queryResult = useWebsiteSessionsQuery(websiteId, { minDuration });

  return (
    <DataGrid
      query={queryResult}
      allowPaging
      allowSearch
      renderActions={() => <SessionFilterButton />}
    >
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
