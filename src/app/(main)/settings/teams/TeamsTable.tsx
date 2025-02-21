import { GridColumn, GridTable, Icon, Text } from 'react-basics';
import { useMessages } from '@/components/hooks';
import Icons from '@/components/icons';
import { ROLES } from '@/lib/constants';
import LinkButton from '@/components/common/LinkButton';

export function TeamsTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  allowEdit?: boolean;
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <GridTable data={data}>
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
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const { id } = row;

            return (
              <LinkButton href={`/teams/${id}/settings`}>
                <Icon>
                  <Icons.ArrowRight />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </LinkButton>
            );
          }}
        </GridColumn>
      )}
    </GridTable>
  );
}

export default TeamsTable;
