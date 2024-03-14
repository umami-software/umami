import { GridColumn, GridTable, Icon, Text } from 'react-basics';
import { useLogin, useMessages } from 'components/hooks';
import Icons from 'components/icons';
import LinkButton from 'components/common/LinkButton';

export function TeamWebsitesTable({
  teamId,
  data = [],
  allowEdit = false,
}: {
  teamId: string;
  data: any[];
  allowEdit?: boolean;
}) {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();

  return (
    <GridTable data={data}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      <GridColumn name="createdBy" label={formatMessage(labels.createdBy)}>
        {row => row?.createUser?.username}
      </GridColumn>
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          const { id: websiteId } = row;
          return (
            <>
              {allowEdit && (teamId || user?.isAdmin) && (
                <LinkButton href={`/teams/${teamId}/settings/websites/${websiteId}`}>
                  <Icon>
                    <Icons.Edit />
                  </Icon>
                  <Text>{formatMessage(labels.edit)}</Text>
                </LinkButton>
              )}
              <LinkButton href={`/teams/${teamId}/websites/${websiteId}`}>
                <Icon>
                  <Icons.ArrowRight />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </LinkButton>
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamWebsitesTable;
