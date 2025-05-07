import { DataColumn, DataTable, Icon, MenuItem, Text, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { ROLES } from '@/lib/constants';
import { MenuButton } from '@/components/input/MenuButton';

export function TeamsTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  allowEdit?: boolean;
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="owner" label={formatMessage(labels.owner)}>
        {(row: any) => row.teamUser.find(({ role }) => role === ROLES.teamOwner)?.user?.username}
      </DataColumn>
      <DataColumn id="websites" label={formatMessage(labels.websites)}>
        {(row: any) => row._count.website}
      </DataColumn>
      <DataColumn id="members" label={formatMessage(labels.members)}>
        {(row: any) => row._count.teamUser}
      </DataColumn>
      {showActions && (
        <DataColumn id="action" label=" " align="end">
          {(row: any) => {
            const { id } = row;

            return (
              <MenuButton>
                <MenuItem href={`/teams/${id}`}>
                  <Row alignItems="center" gap>
                    <Icon>
                      <Icons.Arrow />
                    </Icon>
                    <Text>{formatMessage(labels.view)}</Text>
                  </Row>
                </MenuItem>
                <MenuItem href={`/teams/${id}/settings`}>
                  <Row alignItems="center" gap>
                    <Icon>
                      <Icons.Edit />
                    </Icon>
                    <Text>{formatMessage(labels.edit)}</Text>
                  </Row>
                </MenuItem>
              </MenuButton>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
