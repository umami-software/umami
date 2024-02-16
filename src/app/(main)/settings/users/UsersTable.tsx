import { Text, Icon, Icons, GridTable, GridColumn, useBreakpoint } from 'react-basics';
import { formatDistance } from 'date-fns';
import { ROLES } from 'lib/constants';
import { useMessages, useLocale } from 'components/hooks';
import UserDeleteButton from './UserDeleteButton';
import LinkButton from 'components/common/LinkButton';

export function UsersTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { dateLocale } = useLocale();
  const breakpoint = useBreakpoint();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="username" label={formatMessage(labels.username)} style={{ minWidth: 0 }} />
      <GridColumn name="role" label={formatMessage(labels.role)} width={'120px'}>
        {row =>
          formatMessage(
            labels[Object.keys(ROLES).find(key => ROLES[key] === row.role)] || labels.unknown,
          )
        }
      </GridColumn>
      <GridColumn name="created" label={formatMessage(labels.created)} width={'150px'}>
        {row =>
          formatDistance(new Date(row.createdAt), new Date(), {
            addSuffix: true,
            locale: dateLocale,
          })
        }
      </GridColumn>
      <GridColumn name="websites" label={formatMessage(labels.websites)} width={'120px'}>
        {row => row._count.website}
      </GridColumn>
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const { id, username } = row;
            return (
              <>
                <UserDeleteButton userId={id} username={username} />
                <LinkButton href={`/settings/users/${id}`}>
                  <Icon>
                    <Icons.Edit />
                  </Icon>
                  <Text>{formatMessage(labels.edit)}</Text>
                </LinkButton>
              </>
            );
          }}
        </GridColumn>
      )}
    </GridTable>
  );
}

export default UsersTable;
