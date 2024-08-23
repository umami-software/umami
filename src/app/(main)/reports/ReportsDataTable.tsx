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

  return (
    <DataTable queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
