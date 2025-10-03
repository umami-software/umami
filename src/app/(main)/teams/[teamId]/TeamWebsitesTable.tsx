import { DataColumn, DataTable, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import Link from 'next/link';
import { ROLES } from '@/lib/constants';
import { TeamMemberEditButton } from '@/app/(main)/teams/[teamId]/TeamMemberEditButton';
import { TeamMemberRemoveButton } from '@/app/(main)/teams/[teamId]/TeamMemberRemoveButton';

export function TeamWebsitesTable({
  teamId,
  data = [],
  allowEdit,
}: {
  teamId: string;
  data: any[];
  allowEdit: boolean;
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => <Link href={`/teams/${teamId}/websites/${row.id}`}>{row.name}</Link>}
      </DataColumn>
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      <DataColumn id="createdBy" label={formatMessage(labels.createdBy)}>
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
