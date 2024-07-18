import { useReports } from 'components/hooks';
import ReportsTable from './ReportsTable';
import DataTable from 'components/common/DataTable';
import { ReactNode } from 'react';

export default function ReportsDataTable({
  websiteId,
  teamId,
  children,
}: {
  websiteId?: string;
  teamId?: string;
  children?: ReactNode;
}) {
  const queryResult = useReports({ websiteId, teamId });

  if (queryResult?.result?.data?.length === 0) {
    return children;
  }

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
