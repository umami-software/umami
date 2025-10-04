import { ReactNode } from 'react';
import { Icon, DataTable, DataColumn } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { SquarePen } from '@/components/icons';
import { Empty } from '@/components/common/Empty';

export function WebsitesTable({
  data = [],
  showActions,
  renderLink,
}: {
  data: Record<string, any>[];
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  renderLink?: (row: any) => ReactNode;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
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
              <LinkButton href={renderUrl(`/websites/${websiteId}/settings`)} variant="quiet">
                <Icon>
                  <SquarePen />
                </Icon>
              </LinkButton>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
