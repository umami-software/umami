import { DataGrid } from '@/components/common/DataGrid';
import { useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';

export function SessionsDataTable({ websiteId }: { websiteId: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return <SessionsTable data={data} websiteId={websiteId} />;
      }}
    </DataGrid>
  );
}
