'use client';
import { useApi } from 'components/hooks';
import ReportsTable from './ReportsTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useCache from 'store/cache';

export default function ReportsDataTable({ websiteId }: { websiteId?: string }) {
  const { get } = useApi();
  const modified = useCache(state => (state as any)?.reports);
  const queryResult = useFilterQuery({
    queryKey: ['reports', { websiteId, modified }],
    queryFn: (params: any) =>
      get(websiteId ? `/websites/${websiteId}/reports` : `/reports`, params),
  });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
