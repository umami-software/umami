import { ReactNode } from 'react';
import { Row, Text, Icon, DataTable, DataColumn, MenuItem } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MenuButton } from '@/components/input/MenuButton';
import { Lucide } from '@/components/icons';
import Link from 'next/link';

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
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => <Link href={renderTeamUrl(`/websites/${row.id}`)}>{row.name}</Link>}
      </DataColumn>
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <DataColumn id="action" label=" " align="end">
          {(row: any) => {
            const websiteId = row.id;

            return (
              <MenuButton>
                {allowEdit && (
                  <MenuItem href={renderTeamUrl(`/websites/${websiteId}`)}>
                    <Row alignItems="center" gap>
                      <Icon data-test="link-button-view">
                        <Lucide.Eye />
                      </Icon>
                      <Text>{formatMessage(labels.view)}</Text>
                    </Row>
                  </MenuItem>
                )}
                {allowView && (
                  <MenuItem href={renderTeamUrl(`/settings/websites/${websiteId}`)}>
                    <Row alignItems="center" gap>
                      <Icon data-test="link-button-edit">
                        <Lucide.SquarePen />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Row>
                  </MenuItem>
                )}
              </MenuButton>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
