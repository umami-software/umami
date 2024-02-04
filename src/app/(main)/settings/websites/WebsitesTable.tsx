'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { Button, Text, Icon, Icons, GridTable, GridColumn, useBreakpoint } from 'react-basics';
import { useMessages, useLogin, useTeamContext } from 'components/hooks';

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
  const { renderTeamUrl } = useTeamContext();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const { id } = row;

            return (
              <>
                {allowEdit && (teamId || user.isAdmin) && (
                  <Link href={renderTeamUrl(`/settings/websites/${id}`)}>
                    <Button>
                      <Icon>
                        <Icons.Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Button>
                  </Link>
                )}
                {allowView && (
                  <Link href={renderTeamUrl(renderTeamUrl(`/websites/${id}`))}>
                    <Button>
                      <Icon>
                        <Icons.ArrowRight />
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
