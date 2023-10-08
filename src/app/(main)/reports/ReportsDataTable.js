'use client';
import { useApi } from 'components/hooks';
import ReportsTable from './ReportsTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useCache from 'store/cache';

function useReports() {
  const { get } = useApi();
  const modified = useCache(state => state?.reports);
  return useFilterQuery(['reports', modified], params => get(`/reports`, params));
}

export default function ReportsDataTable() {
  const queryResult = useReports();

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={true} />}
    </DataTable>
  );
}
