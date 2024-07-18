import { ReactNode } from 'react';
import { Text, Icon, Icons, GridTable, GridColumn, useBreakpoint } from 'react-basics';
import { useMessages, useTeamUrl } from 'components/hooks';
import LinkButton from 'components/common/LinkButton';

export interface WebsitesTableProps {
  data: any[];
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  teamId?: string;
  children?: ReactNode;
}

export function WebsitesTable({
  data = [],
  showActions,
  allowEdit,
  allowView,
  children,
}: WebsitesTableProps) {
  const { formatMessage, labels } = useMessages();
  const breakpoint = useBreakpoint();
  const { renderTeamUrl } = useTeamUrl();

  if (!data?.length) {
    return children;
  }

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const { id: websiteId } = row;

            return (
              <>
                {allowEdit && (
                  <LinkButton href={renderTeamUrl(`/settings/websites/${websiteId}`)}>
                    <Icon data-test="link-button-edit">
                      <Icons.Edit />
                    </Icon>
                    <Text>{formatMessage(labels.edit)}</Text>
                  </LinkButton>
                )}
                {allowView && (
                  <LinkButton href={renderTeamUrl(`/websites/${websiteId}`)}>
                    <Icon>
                      <Icons.ArrowRight />
                    </Icon>
                    <Text>{formatMessage(labels.view)}</Text>
                  </LinkButton>
                )}
              </>
            );
          }}
        </GridColumn>
      )}
    </GridTable>
  );
}

export default WebsitesTable;
