import { ReactNode } from 'react';
import { useReportsQuery } from '@/components/hooks';
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
  const queryResult = useReportsQuery({ websiteId, teamId });

  return (
    <DataGrid queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataGrid>
  );
}
