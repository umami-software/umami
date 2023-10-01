import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import Link from 'next/link';
import { Button, GridColumn, GridTable, Icon, Icons, Text } from 'react-basics';
import TeamWebsiteRemoveButton from '../TeamWebsiteRemoveButton';

export function TeamWebsitesTable({ data = [], onSave }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  return (
    <GridTable data={data}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          const { id: teamId, teamUser } = row.teamWebsite[0].team;
          const { id: websiteId, userId } = row;
          const owner = teamUser[0];
          const canRemove = user.id === userId || user.id === owner.userId;
          return (
            <>
              <Link href={`/websites/${websiteId}`}>
                <Button>
                  <Icon>
                    <Icons.External />
                  </Icon>
                  <Text>{formatMessage(labels.view)}</Text>
                </Button>
              </Link>
              {canRemove && (
                <TeamWebsiteRemoveButton teamId={teamId} websiteId={websiteId} onSave={onSave} />
              )}
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamWebsitesTable;
