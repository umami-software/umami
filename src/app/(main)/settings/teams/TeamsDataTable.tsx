'use client';
import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import { useTeams } from 'components/hooks';

export function TeamsDataTable() {
  const queryResult = useTeams();

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => {
        return <TeamsTable data={data} />;
      }}
    </DataTable>
  );
}

export default TeamsDataTable;
