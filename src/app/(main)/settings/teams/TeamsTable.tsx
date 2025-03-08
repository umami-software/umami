import { DataColumn, DataTable, Icon, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { ROLES } from '@/lib/constants';
import { LinkButton } from '@/components/common/LinkButton';

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
              <LinkButton href={`/teams/${id}/settings`}>
                <Icon>
                  <Icons.Arrow />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </LinkButton>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
