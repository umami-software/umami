import { useWebsiteSessions } from '@/components/hooks';
import SessionsTable from './SessionsTable';
import DataTable from '@/components/common/DataTable';
import { ReactNode } from 'react';

export default function SessionsDataTable({
  websiteId,
  children,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const queryResult = useWebsiteSessions(websiteId);

  return (
    <DataTable queryResult={queryResult} allowSearch={true} renderEmpty={() => children}>
      {({ data }) => <SessionsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
