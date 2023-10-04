'use client';
import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';

export function TeamsDataTable() {
  const { get } = useApi();
  const queryResult = useFilterQuery(['teams'], params => {
    return get(`/teams`, {
      ...params,
    });
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
