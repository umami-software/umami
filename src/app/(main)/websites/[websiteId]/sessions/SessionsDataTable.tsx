import { useWebsiteSessions } from '@/components/hooks';
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
  const queryResult = useWebsiteSessions(websiteId);

  return (
    <DataGrid queryResult={queryResult} allowSearch={false} renderEmpty={() => children}>
      {({ data }) => <SessionsTable data={data} showDomain={!websiteId} />}
    </DataGrid>
  );
}
