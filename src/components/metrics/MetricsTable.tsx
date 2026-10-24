import { Grid, Row } from '@umami/react-zen';
import { useEffect, useMemo } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useNavigation, useWebsiteMetricsQuery } from '@/components/hooks';
import { Maximize } from '@/components/icons';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { percentFilter } from '@/lib/filters';
import { ListTable, type ListTableProps } from './ListTable';

export interface MetricsTableProps extends ListTableProps {
  websiteId: string;
  type: string;
  dataFilter?: (data: any) => any;
  limit?: number;
  showMore?: boolean;
  filterLink?: boolean;
  params?: Record<string, any>;
  onDataLoad?: (data: any) => void;
}

export function MetricsTable({
  websiteId,
  type,
  dataFilter,
  limit,
  showMore = false,
  filterLink = true,
  params,
  onDataLoad,
  ...props
}: MetricsTableProps) {
  const { updateParams } = useNavigation();
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteMetricsQuery(websiteId, {
    type,
    limit,
    ...params,
  });

  const filteredData = useMemo(() => {
    if (data) {
      // Handle both old format (array) and new format ({ data, total })
      const items = Array.isArray(data) ? data : data.data;
      const total = Array.isArray(data) ? undefined : data.total;

      let filtered = items as any[];

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          filtered = dataFilter.reduce((arr, filter) => {
            return filter(arr);
          }, filtered);
        } else {
          filtered = dataFilter(filtered);
        }
      }

      filtered = percentFilter(filtered, total);

      return filtered.map(({ x, y, z, ...props }) => ({ label: x, count: y, percent: z, ...props }));
    }
    return [];
  }, [data, dataFilter, limit, type]);

  useEffect(() => {
    if (data) {
      onDataLoad?.(data);
    }
  }, [data]);

  const renderLabel = (row: any) => {
    return filterLink ? <MetricLabel type={type} data={row} /> : row.label;
  };

  return (
    <LoadingPanel
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      minHeight="400px"
    >
      <Grid padding="2">
        {data && <ListTable {...props} data={filteredData} renderLabel={renderLabel} />}
        {showMore && limit && (
          <Row justifyContent="center" alignItems="flex-end" paddingTop="4">
            <LinkButton href={updateParams({ view: type })} variant="quiet">
              <IconLabel icon={<Maximize />}>{t(labels.more)}</IconLabel>
            </LinkButton>
          </Row>
        )}
      </Grid>
    </LoadingPanel>
  );
}
