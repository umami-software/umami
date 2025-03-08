import { ReactNode } from 'react';
import { useReports } from '@/components/hooks';
import { DataGrid } from '@/components/common/DataGrid';
import { ReportsTable } from './ReportsTable';

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
