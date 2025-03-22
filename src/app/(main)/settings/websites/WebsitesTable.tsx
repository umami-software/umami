import { ReactNode } from 'react';
import { Row, Text, Icon, Icons, DataTable, DataColumn, Button } from '@umami/react-zen';
import Link from 'next/link';
import { useMessages, useNavigation } from '@/components/hooks';

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
  const { renderTeamUrl } = useNavigation();

  if (!data?.length) {
    return children;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <DataColumn id="action" label=" " align="end">
          {(row: any) => {
            const websiteId = row.id;

            return (
              <Row gap="3">
                {allowEdit && (
                  <Button asChild>
                    <Link href={renderTeamUrl(`/settings/websites/${websiteId}`)}>
                      <Icon data-test="link-button-edit">
                        <Icons.Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Link>
                  </Button>
                )}
                {allowView && (
                  <Button asChild>
                    <Link href={renderTeamUrl(`/websites/${websiteId}`)}>
                      <Icon data-test="link-button-view">
                        <Icons.Arrow />
                      </Icon>
                      <Text>{formatMessage(labels.view)}</Text>
                    </Link>
                  </Button>
                )}
              </Row>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
