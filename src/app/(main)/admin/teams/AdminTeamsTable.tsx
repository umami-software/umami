import { DataColumn, DataTable, Dialog, Icon, MenuItem, Modal, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { useState } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages } from '@/components/hooks';
import { Edit, Trash } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';
import { TeamDeleteForm } from '../../teams/[teamId]/TeamDeleteForm';

export function AdminTeamsTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { t, labels } = useMessages();
  const [deleteTeam, setDeleteTeam] = useState(null);

  return (
    <>
      <DataTable data={data}>
        <DataColumn id="name" label={t(labels.name)} width="1fr">
          {(row: any) => <Link href={`/admin/teams/${row.id}`}>{row.name}</Link>}
        </DataColumn>
        <DataColumn id="websites" label={t(labels.members)} width="140px">
          {(row: any) => row?._count?.members}
        </DataColumn>
        <DataColumn id="members" label={t(labels.websites)} width="140px">
          {(row: any) => row?._count?.websites}
        </DataColumn>
        <DataColumn id="owner" label={t(labels.owner)}>
          {(row: any) => {
            const name = row?.members?.[0]?.user?.username;

            return (
              <Text title={name} truncate>
                <Link href={`/admin/users/${row?.members?.[0]?.user?.id}`}>{name}</Link>
              </Text>
            );
          }}
        </DataColumn>
        <DataColumn id="created" label={t(labels.created)} width="160px">
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        {showActions && (
          <DataColumn id="action" align="end" width="50px">
            {(row: any) => {
              const { id } = row;

              return (
                <MenuButton>
                  <MenuItem href={`/admin/teams/${id}`} data-test="link-button-edit">
                    <Row alignItems="center" gap>
                      <Icon>
                        <Edit />
                      </Icon>
                      <Text>{t(labels.edit)}</Text>
                    </Row>
                  </MenuItem>
                  <MenuItem
                    id="delete"
                    onAction={() => setDeleteTeam(id)}
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
      <Modal isOpen={!!deleteTeam}>
        <Dialog style={{ width: 400 }}>
          <TeamDeleteForm teamId={deleteTeam} onClose={() => setDeleteTeam(null)} />
        </Dialog>
      </Modal>
    </>
  );
}
