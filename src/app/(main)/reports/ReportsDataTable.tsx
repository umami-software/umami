import { useReports } from 'components/hooks';
import ReportsTable from './ReportsTable';
import DataTable from 'components/common/DataTable';

export default function ReportsDataTable({
  websiteId,
  teamId,
}: {
  websiteId?: string;
  teamId?: string;
}) {
  const queryResult = useReports({ websiteId, teamId });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
