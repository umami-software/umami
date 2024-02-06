import DataTable from 'components/common/DataTable';
import TeamsTable from 'app/(main)/settings/teams/TeamsTable';
import { useTeams } from 'components/hooks';

export function TeamsDataTable({
  allowEdit,
  showActions,
}: {
  allowEdit?: boolean;
  showActions?: boolean;
}) {
  const queryResult = useTeams();

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => {
        return <TeamsTable data={data} allowEdit={allowEdit} showActions={showActions} />;
      }}
    </DataTable>
  );
}

export default TeamsDataTable;
