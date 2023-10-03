'use client';
import { useApi } from 'components/hooks';
import ReportsTable from './ReportsTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';

function useReports() {
  const { get, del, useMutation } = useApi();
  const { mutate } = useMutation(reportId => del(`/reports/${reportId}`));
  const reports = useFilterQuery(['reports'], params => get(`/reports`, params));

  const deleteReport = id => {
    mutate(id, {
      onSuccess: () => {
        reports.refetch();
      },
    });
  };

  return { reports, deleteReport };
}

export default function ReportsList() {
  const { reports, deleteReport } = useReports();

  const handleDelete = async (id, callback) => {
    await deleteReport(id);
    await reports.refetch();
    callback?.();
  };

  return (
    <DataTable {...reports.getProps()}>
      {({ data }) => <ReportsTable data={data} showDomain={true} onDelete={handleDelete} />}
    </DataTable>
  );
}
