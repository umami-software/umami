'use client';
import { useReports } from 'components/hooks';
import ReportsTable from './ReportsTable';
import DataTable from 'components/common/DataTable';

export default function ReportsDataTable({ websiteId }: { websiteId?: string }) {
  const queryResult = useReports(websiteId);

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
