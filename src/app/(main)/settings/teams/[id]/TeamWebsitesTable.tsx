import Link from 'next/link';
import { Button, GridColumn, GridTable, Icon, Icons, Text } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import TeamWebsiteRemoveButton from './TeamWebsiteRemoveButton';

export function TeamWebsitesTable({
  data = [],
  readOnly,
  onRemove,
}: {
  data: any[];
  readOnly: boolean;
  onRemove: () => void;
}) {
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
          const canRemove = !readOnly && (user.id === userId || user.id === owner.userId);
          return (
            <>
              {canRemove && (
                <TeamWebsiteRemoveButton teamId={teamId} websiteId={websiteId} onSave={onRemove} />
              )}
              <Link href={`/websites/${websiteId}`}>
                <Button>
                  <Icon>
                    <Icons.External />
                  </Icon>
                  <Text>{formatMessage(labels.view)}</Text>
                </Button>
              </Link>
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamWebsitesTable;
