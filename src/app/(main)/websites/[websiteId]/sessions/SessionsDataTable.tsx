import { DataGrid } from '@/components/common/DataGrid';
import { useSessionStream, useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';

export function SessionsDataTable({ websiteId }: { websiteId?: string; teamId?: string }) {
  useSessionStream(websiteId);
  const queryResult = useWebsiteSessionsQuery(websiteId);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => {
        return <SessionsTable data={data} />;
      }}
    </DataGrid>
  );
}
