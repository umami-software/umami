import Link from 'next/link';
import { Button, Text, Icon, Icons, GridTable, GridColumn, useBreakpoint } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';

export function WebsitesTable({
  data = [],
  showTeam,
  showActions,
  allowEdit,
  allowView,
  children,
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
  const breakpoint = useBreakpoint();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      {showTeam && (
        <GridColumn name="teamName" label={formatMessage(labels.teamName)}>
          {row => row.teamWebsite[0]?.team.name}
        </GridColumn>
      )}
      {showTeam && (
        <GridColumn name="owner" label={formatMessage(labels.owner)}>
          {row => row.user.username}
        </GridColumn>
      )}
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const {
              id,
              user: { id: ownerId },
            } = row;

            return (
              <>
                {allowEdit && (!showTeam || ownerId === user.id) && (
                  <Link href={`/settings/websites/${id}`}>
                    <Button>
                      <Icon>
                        <Icons.Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Button>
                  </Link>
                )}
                {allowView && (
                  <Link href={`/websites/${id}`}>
                    <Button>
                      <Icon>
                        <Icons.External />
                      </Icon>
                      <Text>{formatMessage(labels.view)}</Text>
                    </Button>
                  </Link>
                )}
              </>
            );
          }}
        </GridColumn>
      )}
      {children}
    </GridTable>
  );
}

export default WebsitesTable;
