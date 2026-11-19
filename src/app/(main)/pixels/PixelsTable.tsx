import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import { useMemo } from 'react';
import { WebsiteSparkline } from '@/app/(main)/websites/WebsiteSparkline';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import Link from '@/components/common/Link';
import { SortableLabel } from '@/components/common/SortableLabel';
import { useMessages, useNavigation, usePixelListChartsQuery, useSlug } from '@/components/hooks';
import { PixelDeleteButton } from './PixelDeleteButton';
import { PixelEditButton } from './PixelEditButton';

export interface PixelsTableProps extends DataTableProps {
  showActions?: boolean;
}

export function PixelsTable({
  showActions,
  data = [],
  ...props
}: PixelsTableProps & { data?: any[] }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('pixel');
  const pixelIds = useMemo(() => data.map(row => row.id), [data]);
  const chartsQuery = usePixelListChartsQuery(pixelIds);
  const charts = chartsQuery.data?.data || {};
  const isChartLoading = chartsQuery.isLoading && !chartsQuery.data;

  return (
    <DataTable {...props} data={data}>
      <DataColumn id="name" label={<SortableLabel label={t(labels.name)} sortKey="name" />}>
        {({ id, name }: any) => {
          return <Link href={renderUrl(`/pixels/${id}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn id="url" label={<SortableLabel label="URL" sortKey="slug" />} style={{ minWidth: 0 }}>
        {({ slug }: any) => {
          const url = getSlugUrl(slug);
          return (
            <ExternalLink href={url} prefetch={false}>
              {url}
            </ExternalLink>
          );
        }}
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
        <DataColumn id="action" align="end" width="72px">
          {(row: any) => {
            const { id, name } = row;

            return (
              <Row gap="2">
                <PixelEditButton pixelId={id} />
                <PixelDeleteButton pixelId={id} name={name} />
              </Row>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
