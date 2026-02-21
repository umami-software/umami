import { DataColumn, DataTable, Icon, MenuItem, Modal, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { useState } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages } from '@/components/hooks';
import { Edit, Trash } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';
import { ROLES } from '@/lib/constants';
import { UserDeleteForm } from './UserDeleteForm';

export function UsersTable({
  data = [],
  showActions = true,
  ...props
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { t, labels } = useMessages();
  const [deleteUser, setDeleteUser] = useState(null);

  return (
    <>
      <DataTable data={data} {...props}>
        <DataColumn id="username" label={t(labels.username)} width="2fr">
          {(row: any) => <Link href={`/admin/users/${row.id}`}>{row.username}</Link>}
        </DataColumn>
        <DataColumn id="role" label={t(labels.role)}>
          {(row: any) =>
            t(labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown)
          }
        </DataColumn>
        <DataColumn id="websites" label={t(labels.websites)}>
          {(row: any) => row._count.websites}
        </DataColumn>
        <DataColumn id="created" label={t(labels.created)}>
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
                      <Text>{t(labels.edit)}</Text>
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
                      <Text>{t(labels.delete)}</Text>
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
