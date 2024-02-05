'use client';
import { GridColumn, GridTable, Icon, Text, useBreakpoint } from 'react-basics';
import { useMessages, useLogin } from 'components/hooks';
import Icons from 'components/icons';
import { ROLES } from 'lib/constants';
import LinkButton from 'components/common/LinkButton';

export function TeamsTable({ data = [] }: { data: any[] }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const breakpoint = useBreakpoint();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="owner" label={formatMessage(labels.owner)}>
        {row => row.teamUser.find(({ role }) => role === ROLES.teamOwner)?.user?.username}
      </GridColumn>
      <GridColumn name="websites" label={formatMessage(labels.websites)}>
        {row => row._count.website}
      </GridColumn>
      <GridColumn name="members" label={formatMessage(labels.members)}>
        {row => row._count.teamUser}
      </GridColumn>
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          const { id, teamUser } = row;
          const owner = teamUser.find(({ role }) => role === ROLES.teamOwner);
          const isOwner = user.id === owner?.userId;

          return (
            <>
              {isOwner && (
                <LinkButton href={`/settings/teams/${id}`}>
                  <Icon>
                    <Icons.Edit />
                  </Icon>
                  <Text>{formatMessage(labels.edit)}</Text>
                </LinkButton>
              )}
              <LinkButton href={`/teams/${id}`}>
                <Icon>
                  <Icons.Change />
                </Icon>
                <Text>{formatMessage(labels.switch)}</Text>
              </LinkButton>
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamsTable;
