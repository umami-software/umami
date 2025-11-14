import { DataColumn, DataTable, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { TeamMemberRemoveButton } from './TeamMemberRemoveButton';
import { TeamMemberEditButton } from './TeamMemberEditButton';

export function TeamMembersTable({
  data = [],
  teamId,
  allowEdit = false,
}: {
  data: any[];
  teamId: string;
  allowEdit: boolean;
}) {
  const { formatMessage, labels } = useMessages();

  const roles = {
    [ROLES.teamOwner]: formatMessage(labels.teamOwner),
    [ROLES.teamManager]: formatMessage(labels.teamManager),
    [ROLES.teamMember]: formatMessage(labels.teamMember),
    [ROLES.teamViewOnly]: formatMessage(labels.viewOnly),
  };

  return (
    <DataTable data={data}>
      <DataColumn id="username" label={formatMessage(labels.username)}>
        {(row: any) => row?.user?.username}
      </DataColumn>
      <DataColumn id="role" label={formatMessage(labels.role)}>
        {(row: any) => roles[row?.role]}
      </DataColumn>
      {allowEdit && (
        <DataColumn id="action" align="end">
          {(row: any) => {
            if (row?.role === ROLES.teamOwner) {
              return null;
            }

            return (
              <Row alignItems="center" maxHeight="20px">
                <TeamMemberEditButton teamId={teamId} userId={row?.user?.id} role={row?.role} />
                <TeamMemberRemoveButton
                  teamId={teamId}
                  userId={row?.user?.id}
                  userName={row?.user?.username}
                />
              </Row>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
