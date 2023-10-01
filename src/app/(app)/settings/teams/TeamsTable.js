'use client';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import Link from 'next/link';
import { Button, GridColumn, GridTable, Icon, Icons, Text } from 'react-basics';
import TeamDeleteButton from './TeamDeleteButton';
import TeamLeaveButton from './TeamLeaveButton';

export function TeamsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  return (
    <GridTable data={data}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="owner" label={formatMessage(labels.owner)}>
        {row => row.teamUser.find(({ role }) => role === ROLES.teamOwner)?.user?.username}
      </GridColumn>
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          const { id, name, teamUser } = row;
          const owner = teamUser.find(({ role }) => role === ROLES.teamOwner);
          const showDelete = user.id === owner?.userId;

          return (
            <>
              <Link href={`/settings/teams/${id}`}>
                <Button>
                  <Icon>
                    <Icons.Edit />
                  </Icon>
                  <Text>{formatMessage(labels.view)}</Text>
                </Button>
              </Link>
              {showDelete && <TeamDeleteButton teamId={id} teamName={name} />}
              {!showDelete && <TeamLeaveButton teamId={id} teamName={name} />}
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamsTable;
