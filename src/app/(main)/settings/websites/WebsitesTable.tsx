import { ReactNode } from 'react';
import Link from 'next/link';
import { Button, Text, Icon, Icons, GridTable, GridColumn, useBreakpoint } from 'react-basics';
import { useMessages, useLogin } from 'components/hooks';

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
  teamId,
  children,
}: WebsitesTableProps) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const breakpoint = useBreakpoint();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const { id, userId } = row;

            return (
              <>
                {allowEdit && !teamId && user.id === userId && (
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
                  <Link href={teamId ? `/team/${teamId}/websites/${id}` : `/websites/${id}`}>
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
