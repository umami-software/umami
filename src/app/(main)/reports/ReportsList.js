'use client';
import { useApi } from 'components/hooks';
import ReportsTable from './ReportsTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';

function useReports() {
  const { get, del, useMutation } = useApi();
  const { mutate } = useMutation(reportId => del(`/reports/${reportId}`));
  const queryResult = useFilterQuery(['reports'], params => get(`/reports`, params));

  const deleteReport = id => {
    mutate(id, {
      onSuccess: () => {
        queryResult.refetch();
      },
    });
  };

  return { queryResult, deleteReport };
}

export default function ReportsList() {
  const { queryResult, deleteReport } = useReports();

  const handleDelete = async (id, callback) => {
    await deleteReport(id);
    await queryResult.refetch();
    callback?.();
  };

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={true} onDelete={handleDelete} />}
    </DataTable>
  );
}
