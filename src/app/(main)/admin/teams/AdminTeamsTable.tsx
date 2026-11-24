import {
  DataColumn,
  DataTable,
  Dialog,
  DialogContent,
  DropdownMenuItem,
  Icon,
  Row,
  Text,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import Link from '@/components/common/Link';
import { SortableLabel } from '@/components/common/SortableLabel';
import { useMessages } from '@/components/hooks';
import { Edit, Trash } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';
import { ROLES } from '@/lib/constants';
import { TeamDeleteForm } from '../../teams/[teamId]/TeamDeleteForm';

export function AdminTeamsTable({
  data = [],
  showActions = true,
  ...props
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { t, labels } = useMessages();
  const router = useRouter();
  const [deleteTeam, setDeleteTeam] = useState(null);

  return (
    <>
      <DataTable data={data} {...props}>
        <DataColumn
          id="name"
          label={<SortableLabel label={t(labels.name)} sortKey="name" />}
          width="1fr"
        >
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
            const owner = row?.members?.find(({ role }) => role === ROLES.teamOwner)?.user;

            return (
              <Text title={owner?.username} truncate>
                {owner && <Link href={`/admin/users/${owner.id}`}>{owner.username}</Link>}
              </Text>
            );
          }}
        </DataColumn>
        <DataColumn
          id="created"
          label={
            <SortableLabel label={t(labels.created)} sortKey="createdAt" defaultDirection="desc" />
          }
          width="160px"
        >
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        {showActions && (
          <DataColumn id="action" align="end" width="50px">
            {(row: any) => {
              const { id } = row;

              return (
                <MenuButton>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/teams/${id}`)}
                    data-test="link-button-edit"
                  >
                    <Row alignItems="center" gap>
                      <Icon>
                        <Edit />
                      </Icon>
                      <Text>{t(labels.edit)}</Text>
                    </Row>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteTeam(id)}
                    data-test="link-button-delete"
                  >
                    <Row alignItems="center" gap>
                      <Icon>
                        <Trash />
                      </Icon>
                      <Text>{t(labels.delete)}</Text>
                    </Row>
                  </DropdownMenuItem>
                </MenuButton>
              );
            }}
          </DataColumn>
        )}
      </DataTable>
      <Dialog open={!!deleteTeam} onOpenChange={open => !open && setDeleteTeam(null)}>
        <DialogContent style={{ width: 400 }}>
          <TeamDeleteForm teamId={deleteTeam} onClose={() => setDeleteTeam(null)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
