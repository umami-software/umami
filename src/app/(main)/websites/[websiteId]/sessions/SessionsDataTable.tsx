import { useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';
import { DataGrid } from '@/components/common/DataGrid';

export function SessionsDataTable({ websiteId }: { websiteId?: string; teamId?: string }) {
  const queryResult = useWebsiteSessionsQuery(websiteId);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return <SessionsTable data={data} />;
      }}
    </DataGrid>
  );
}
