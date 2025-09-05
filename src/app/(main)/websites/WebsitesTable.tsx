import { ReactNode } from 'react';
import { Row, Text, Icon, DataTable, DataColumn, MenuItem } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { MenuButton } from '@/components/input/MenuButton';
import { Eye, SquarePen } from '@/components/icons';

export function WebsitesTable({
  data = [],
  showActions,
  allowEdit,
  allowView,
  renderLink,
  children,
}: {
  data: Record<string, any>[];
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  renderLink?: (row: any) => ReactNode;
  children?: ReactNode;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  if (!data?.length) {
    return children;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {renderLink}
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
                  <MenuItem href={renderUrl(`/websites/${websiteId}/settings`)}>
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
