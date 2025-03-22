import { DataColumn, DataTable, Icon, Text } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/common/LinkButton';

export function TeamWebsitesTable({
  teamId,
  data = [],
  allowEdit = false,
}: {
  teamId: string;
  data: any[];
  allowEdit?: boolean;
}) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      <DataColumn id="createdBy" label={formatMessage(labels.createdBy)}>
        {(row: any) => row?.createUser?.username}
      </DataColumn>
      <DataColumn id="action" label=" " align="end">
        {(row: any) => {
          const { id: websiteId } = row;
          return (
            <>
              {allowEdit && (teamId || user?.isAdmin) && (
                <LinkButton href={`/teams/${teamId}/settings/websites/${websiteId}`}>
                  <Icon>
                    <Icons.Edit />
                  </Icon>
                  <Text>{formatMessage(labels.edit)}</Text>
                </LinkButton>
              )}
              <LinkButton href={`/teams/${teamId}/websites/${websiteId}`}>
                <Icon>
                  <Icons.Arrow />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </LinkButton>
            </>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
