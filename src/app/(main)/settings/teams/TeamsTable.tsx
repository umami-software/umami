import { DataColumn, DataTable, Icon, MenuItem, Text, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Eye, Edit } from '@/components/icons';
import { ROLES } from '@/lib/constants';
import { MenuButton } from '@/components/input/MenuButton';
import Link from 'next/link';

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
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => <Link href={`/settings/teams/${row.id}`}>{row.name}</Link>}
      </DataColumn>
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
                      <Eye />
                    </Icon>
                    <Text>{formatMessage(labels.view)}</Text>
                  </Row>
                </MenuItem>
                <MenuItem href={`/settings/teams/${id}`}>
                  <Row alignItems="center" gap>
                    <Icon>
                      <Edit />
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
