import { useReports } from '@/components/hooks';
import { ReportsTable } from './ReportsTable';
import { DataGrid } from '@/components/common/DataGrid';
import { ReactNode } from 'react';

export function ReportsDataTable({
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
    <DataGrid queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataGrid>
  );
}
