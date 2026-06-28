import { DataColumn, DataTable, Row } from '@umami/react-zen';
import { TeamMemberEditButton } from '@/app/(main)/teams/[teamId]/TeamMemberEditButton';
import { TeamMemberRemoveButton } from '@/app/(main)/teams/[teamId]/TeamMemberRemoveButton';
import Link from '@/components/common/Link';
import { SortableLabel } from '@/components/common/SortableLabel';
import { useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function TeamWebsitesTable({
  teamId,
  data = [],
  allowEdit,
}: {
  teamId: string;
  data: any[];
  allowEdit: boolean;
}) {
  const { t, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={<SortableLabel label={t(labels.name)} sortKey="name" />}>
        {(row: any) => <Link href={`/teams/${teamId}/websites/${row.id}`}>{row.name}</Link>}
      </DataColumn>
      <DataColumn id="domain" label={<SortableLabel label={t(labels.domain)} sortKey="domain" />} />
      <DataColumn id="createdBy" label={t(labels.createdBy)}>
        {(row: any) => row?.createUser?.username}
      </DataColumn>
      {allowEdit && (
        <DataColumn id="action" align="end">
          {(row: any) => {
            if (row?.role === ROLES.teamOwner) {
              return null;
            }

            return (
              <Row alignItems="center">
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
