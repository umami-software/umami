import { ReactNode } from 'react';
import { Row, Text, Icon, DataTable, DataColumn, MenuItem } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MenuButton } from '@/components/input/MenuButton';
import { Eye, SquarePen } from '@/components/icons';
import Link from 'next/link';

export interface WebsitesTableProps {
  data: Record<string, any>[];
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
  const { renderUrl, pathname } = useNavigation();
  const isSettings = pathname.includes('/settings');

  if (!data?.length) {
    return children;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => (
          <Link href={renderUrl(`${isSettings ? '/settings' : ''}/websites/${row.id}`, false)}>
            {row.name}
          </Link>
        )}
      </DataColumn>
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <DataColumn id="action" label=" " align="end">
          {(row: any) => {
            const websiteId = row.id;

            return (
              <MenuButton>
                {allowView && (
                  <MenuItem href={renderUrl(`/websites/${websiteId}`)}>
                    <Row alignItems="center" gap>
                      <Icon data-test="link-button-view">
                        <Eye />
                      </Icon>
                      <Text>{formatMessage(labels.view)}</Text>
                    </Row>
                  </MenuItem>
                )}
                {allowEdit && (
                  <MenuItem href={renderUrl(`/settings/websites/${websiteId}`)}>
                    <Row alignItems="center" gap>
                      <Icon data-test="link-button-edit">
                        <SquarePen />
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
