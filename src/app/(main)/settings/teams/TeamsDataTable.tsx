'use client';
import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';
import useCache from 'store/cache';

export function TeamsDataTable() {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.teams);
  const queryResult = useFilterQuery({
    queryKey: ['teams', { modified }],
    queryFn: (params: any) => {
      return get(`/teams`, {
        ...params,
      });
    },
  });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => {
        return <TeamsTable data={data} />;
      }}
    </DataTable>
  );
}

export default TeamsDataTable;
