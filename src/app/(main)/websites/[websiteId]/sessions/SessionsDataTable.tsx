import { useWebsiteSessions } from 'components/hooks';
import SessionsTable from './SessionsTable';
import DataTable from 'components/common/DataTable';
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

  if (queryResult?.result?.data?.length === 0) {
    return children;
  }

  return (
    <DataTable queryResult={queryResult} allowSearch={false}>
      {({ data }) => <SessionsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
