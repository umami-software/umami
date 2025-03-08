import { Row, Button, Text, Icon, Icons, DataTable, DataColumn } from '@umami/react-zen';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { ROLES } from '@/lib/constants';
import { useMessages, useLocale } from '@/components/hooks';
import { UserDeleteButton } from './UserDeleteButton';

export function UsersTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { dateLocale } = useLocale();

  return (
    <DataTable data={data}>
      <DataColumn id="username" label={formatMessage(labels.username)} style={{ minWidth: 0 }} />
      <DataColumn id="role" label={formatMessage(labels.role)} style={{ maxWidth: 60 }}>
        {(row: any) =>
          formatMessage(
            labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown,
          )
        }
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)} style={{ maxWidth: 60 }}>
        {(row: any) =>
          formatDistance(new Date(row.createdAt), new Date(), {
            addSuffix: true,
            locale: dateLocale,
          })
        }
      </DataColumn>
      <DataColumn id="websites" label={formatMessage(labels.websites)} style={{ maxWidth: 60 }}>
        {(row: any) => row._count.websiteUser}
      </DataColumn>
      {showActions && (
        <DataColumn id="action" align="end">
          {(row: any) => {
            const { id, username } = row;
            return (
              <Row gap="3">
                <UserDeleteButton userId={id} username={username} />
                <Button asChild>
                  <Link href={`/settings/users/${id}`} data-test="link-button-edit">
                    <Icon>
                      <Icons.Edit />
                    </Icon>
                    <Text>{formatMessage(labels.edit)}</Text>
                  </Link>
                </Button>
              </Row>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
