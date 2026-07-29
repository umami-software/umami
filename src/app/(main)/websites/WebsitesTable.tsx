import { DataColumn, DataTable, type DataTableProps, Icon, Text } from '@umami/react-zen';
import { useMemo, type ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { LinkButton } from '@/components/common/LinkButton';
import { SortableLabel } from '@/components/common/SortableLabel';
import { useMessages, useNavigation, useWebsiteListChartsQuery } from '@/components/hooks';
import { SquarePen } from '@/components/icons';
import { decodePunycodeDomain } from '@/lib/format';
import { WebsiteSparkline } from './WebsiteSparkline';

export interface WebsitesTableProps extends DataTableProps {
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  renderLink?: (row: any) => ReactNode;
}

export function WebsitesTable({
  showActions,
  renderLink,
  data = [],
  ...props
}: WebsitesTableProps & { data?: any[] }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const websiteIds = useMemo(() => data.map(row => row.id), [data]);
  const chartsQuery = useWebsiteListChartsQuery(websiteIds);
  const charts = chartsQuery.data?.data || {};
  const isChartLoading = chartsQuery.isLoading && !chartsQuery.data;

  return (
    <DataTable {...props} data={data}>
      <DataColumn
        id="name"
        label={<SortableLabel label={t(labels.name)} sortKey="name" />}
        style={{ minWidth: 0 }}
      >
        {renderLink}
      </DataColumn>
      <DataColumn
        id="domain"
        label={<SortableLabel label={t(labels.domain)} sortKey="domain" />}
        style={{ minWidth: 0 }}
      >
        {(row: any) => (
          <Text
            truncate
            title={decodePunycodeDomain(row.domain) ?? undefined}
            style={{ maxWidth: '100%' }}
          >
            {decodePunycodeDomain(row.domain)}
          </Text>
        )}
      </DataColumn>
      <DataColumn
        id="chart"
        label={<span style={{ whiteSpace: 'normal' }}>{`${t(labels.visitors)} (7d)`}</span>}
        style={{ minWidth: 0 }}
      >
        {(row: any) => {
          const chart = charts[row.id];

          return (
            <WebsiteSparkline
              values={chart?.values}
              total={chart?.total}
              isLoading={isChartLoading}
            />
          );
        }}
      </DataColumn>
      <DataColumn
        id="created"
        label={
          <SortableLabel label={t(labels.created)} sortKey="createdAt" defaultDirection="desc" />
        }
        width="180px"
      >
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      {showActions && (
        <DataColumn id="action" label=" " align="end" width="48px">
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
