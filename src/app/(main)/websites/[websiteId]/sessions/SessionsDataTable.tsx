import { useWebsiteSessionsQuery } from '@/components/hooks';
import { SessionsTable } from './SessionsTable';
import { DataGrid } from '@/components/common/DataGrid';
import { ReactNode } from 'react';

export function SessionsDataTable({
  websiteId,
  children,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const queryResult = useWebsiteSessionsQuery(websiteId);

  return (
    <DataGrid queryResult={queryResult} renderEmpty={() => children} allowPaging>
      {({ data }) => <SessionsTable data={data} showDomain={!websiteId} />}
    </DataGrid>
  );
}
