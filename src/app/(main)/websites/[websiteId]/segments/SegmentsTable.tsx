import { DataTable, DataColumn, Icon, Row, Text, MenuItem } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { Edit, Trash } from '@/components/icons';
import { DateDistance } from '@/components/common/DateDistance';
import { MenuButton } from '@/components/input/MenuButton';

export function SegmentsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="created" label={formatMessage(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
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
              <MenuItem id="delete" onAction={null} data-test="link-button-delete">
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
    </DataTable>
  );
}
