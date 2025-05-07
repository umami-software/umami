import { DataColumn, DataTable, MenuItem } from '@umami/react-zen';
import { useMessages, useLoginQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { TeamMemberRemoveButton } from './TeamMemberRemoveButton';
import { TeamMemberEditButton } from './TeamMemberEditButton';
import { MenuButton } from '@/components/input/MenuButton';

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
  const { user } = useLoginQuery();

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
      <DataColumn id="action" align="end">
        {(row: any) => {
          return (
            allowEdit &&
            row?.role !== ROLES.teamOwner &&
            user?.id !== row?.user?.id && (
              <MenuButton>
                <MenuItem>
                  <TeamMemberEditButton teamId={teamId} userId={row?.user?.id} role={row?.role} />
                </MenuItem>
                <MenuItem>
                  <TeamMemberRemoveButton
                    teamId={teamId}
                    userId={row?.user?.id}
                    userName={row?.user?.username}
                  />
                </MenuItem>
              </MenuButton>
            )
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
