import { DataColumn, DataTable, Icon, MenuItem, Text, Row } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { Arrow, Edit } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';

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
            <MenuButton>
              <MenuItem href={`/teams/${teamId}/websites/${websiteId}`}>
                <Row alignItems="center" gap>
                  <Icon>
                    <Arrow />
                  </Icon>
                  <Text>{formatMessage(labels.view)}</Text>
                </Row>
              </MenuItem>
              {allowEdit && (teamId || user?.isAdmin) && (
                <MenuItem href={`/teams/${teamId}/settings/websites/${websiteId}`}>
                  <Row alignItems="center" gap>
                    <Icon>
                      <Edit />
                    </Icon>
                    <Text>{formatMessage(labels.edit)}</Text>
                  </Row>
                </MenuItem>
              )}
            </MenuButton>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
