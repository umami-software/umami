'use client';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import Link from 'next/link';
import { Button, GridColumn, GridTable, Icon, Icons, Text, useBreakpoint } from 'react-basics';
import TeamLeaveButton from './TeamLeaveButton';

export function TeamsTable({ data = [] }: { data: any[] }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
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
          const { id, name, teamUser } = row;
          const owner = teamUser.find(({ role }) => role === ROLES.teamOwner);
          const isOwner = user.id === owner?.userId;

          return (
            <>
              {!isOwner && <TeamLeaveButton teamId={id} teamName={name} />}
              <Link href={`/settings/teams/${id}`}>
                <Button>
                  <Icon>{isOwner ? <Icons.Edit /> : <Icons.ArrowRight />}</Icon>
                  <Text>{formatMessage(isOwner ? labels.edit : labels.view)}</Text>
                </Button>
              </Link>
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamsTable;
