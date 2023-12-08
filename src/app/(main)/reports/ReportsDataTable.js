'use client';
import { useApi } from 'components/hooks';
import ReportsTable from './ReportsTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useCache from 'store/cache';

export default function ReportsDataTable({ websiteId }) {
  const { get } = useApi();
  const modified = useCache(state => state?.reports);
  const queryResult = useFilterQuery(['reports', { websiteId, modified }], params =>
    get(websiteId ? `/websites/${websiteId}/reports` : `/reports`, params),
  );

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <ReportsTable data={data} showDomain={!websiteId} />}
    </DataTable>
  );
}
