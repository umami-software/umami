import { useState } from 'react';
import { Row, Text, Icon, DataTable, DataColumn, MenuItem, Modal } from '@umami/react-zen';
import Link from 'next/link';
import { ROLES } from '@/lib/constants';
import { Trash } from '@/components/icons';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';
import { UserDeleteForm } from './UserDeleteForm';
import { DateDistance } from '@/components/common/DateDistance';

export function UsersTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const [deleteUser, setDeleteUser] = useState(null);

  return (
    <>
      <DataTable data={data}>
        <DataColumn id="username" label={formatMessage(labels.username)} width="2fr">
          {(row: any) => <Link href={`/admin/users/${row.id}`}>{row.username}</Link>}
        </DataColumn>
        <DataColumn id="role" label={formatMessage(labels.role)}>
          {(row: any) =>
            formatMessage(
              labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown,
            )
          }
        </DataColumn>
        <DataColumn id="websites" label={formatMessage(labels.websites)}>
          {(row: any) => row._count.websites}
        </DataColumn>
        <DataColumn id="created" label={formatMessage(labels.created)}>
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        {showActions && (
          <DataColumn id="action" align="end" width="100px">
            {(row: any) => {
              const { id } = row;

              return (
                <MenuButton>
                  <MenuItem href={`/admin/users/${id}`} data-test="link-button-edit">
                    <Row alignItems="center" gap>
                      <Icon>
                        <Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Row>
                  </MenuItem>
                  <MenuItem
                    id="delete"
                    onAction={() => setDeleteUser(row)}
                    data-test="link-button-delete"
                  >
                    <Row alignItems="center" gap>
                      <Icon>
                        <Trash />
                      </Icon>
                      <Text>{formatMessage(labels.delete)}</Text>
                    </Row>
                  </MenuItem>
                </MenuButton>
              );
            }}
          </DataColumn>
        )}
      </DataTable>
      <Modal isOpen={!!deleteUser}>
        <UserDeleteForm
          userId={deleteUser?.id}
          username={deleteUser?.username}
          onClose={() => {
            setDeleteUser(null);
          }}
        />
      </Modal>
    </>
  );
}
