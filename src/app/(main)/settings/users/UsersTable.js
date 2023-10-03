import { Button, Text, Icon, Icons, GridTable, GridColumn } from 'react-basics';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { ROLES } from 'lib/constants';
import useMessages from 'components/hooks/useMessages';
import useLocale from 'components/hooks/useLocale';
import UserDeleteButton from './UserDeleteButton';

export function UsersTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { dateLocale } = useLocale();

  return (
    <GridTable data={data}>
      <GridColumn
        name="username"
        label={formatMessage(labels.username)}
        width={'minmax(200px, 2fr)'}
      />
      <GridColumn name="role" label={formatMessage(labels.role)}>
        {row =>
          formatMessage(
            labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown,
          )
        }
      </GridColumn>
      <GridColumn name="created" label={formatMessage(labels.created)}>
        {row =>
          formatDistance(new Date(row.createdAt), new Date(), {
            addSuffix: true,
            locale: dateLocale,
          })
        }
      </GridColumn>
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          const { id, username } = row;
          return (
            <>
              <Link href={`/settings/users/${id}`}>
                <Button>
                  <Icon>
                    <Icons.Edit />
                  </Icon>
                  <Text>{formatMessage(labels.edit)}</Text>
                </Button>
              </Link>
              <UserDeleteButton userId={id} username={username} />
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default UsersTable;
