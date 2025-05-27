import { useState } from 'react';
import {
  Row,
  Text,
  Icon,
  DataTable,
  DataColumn,
  MenuItem,
  MenuSeparator,
  Modal,
  Dialog,
} from '@umami/react-zen';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { ROLES } from '@/lib/constants';
import { Trash } from '@/components/icons';
import { useMessages, useLocale } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';
import { UserDeleteForm } from '@/app/(main)/settings/users/UserDeleteForm';

export function UsersTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { dateLocale } = useLocale();
  const [deleteUser, setDeleteUser] = useState(null);
  const handleDelete = () => {};

  return (
    <>
      <DataTable data={data}>
        <DataColumn id="username" label={formatMessage(labels.username)} width="2fr">
          {(row: any) => <Link href={`/settings/users/${row.id}`}>{row.username}</Link>}
        </DataColumn>
        <DataColumn id="role" label={formatMessage(labels.role)}>
          {(row: any) =>
            formatMessage(
              labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown,
            )
          }
        </DataColumn>
        <DataColumn id="created" label={formatMessage(labels.created)}>
          {(row: any) =>
            formatDistance(new Date(row.createdAt), new Date(), {
              addSuffix: true,
              locale: dateLocale,
            })
          }
        </DataColumn>
        <DataColumn id="websites" label={formatMessage(labels.websites)} width="100px">
          {(row: any) => row._count.websiteUser}
        </DataColumn>
        {showActions && (
          <DataColumn id="action" align="end" width="100px">
            {(row: any) => {
              const { id } = row;

              return (
                <MenuButton>
                  <MenuItem href={`/settings/users/${id}`} data-test="link-button-edit">
                    <Row alignItems="center" gap>
                      <Icon>
                        <Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Row>
                  </MenuItem>
                  <MenuSeparator />
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
        <Dialog title={formatMessage(labels.deleteUser)}>
          {({ close }) => (
            <UserDeleteForm
              userId={deleteUser?.id}
              username={deleteUser?.username}
              onSave={handleDelete}
              onClose={() => {
                close();
                setDeleteUser(null);
              }}
            />
          )}
        </Dialog>
      </Modal>
    </>
  );
}
