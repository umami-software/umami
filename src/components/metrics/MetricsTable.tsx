import { Grid, Icon, Row, Text } from '@umami/react-zen';
import { useEffect, useMemo } from 'react';
import { LinkButton } from '@/components/common/LinkButton';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useNavigation, useShare, useWebsiteMetricsQuery } from '@/components/hooks';
import { ArrowRight } from '@/components/icons';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { percentFilter } from '@/lib/filters';
import { buildPath } from '@/lib/url';
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
  const { query, renderUrl, linkId, pixelId } = useNavigation();
  const share = useShare();
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteMetricsQuery(websiteId, {
    type,
    limit,
    ...params,
  });

  const filteredData = useMemo(() => {
    if (data) {
      let items = data as any[];

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          items = dataFilter.reduce((arr, filter) => {
            return filter(arr);
          }, items);
        } else {
          items = dataFilter(items);
        }
      }

      items = percentFilter(items);

      return items.map(({ x, y, z, ...props }) => ({ label: x, count: y, percent: z, ...props }));
    }
    return [];
  }, [data, dataFilter, limit, type]);

  useEffect(() => {
    if (data) {
      onDataLoad?.(data);
    }
  }, [data]);

  // The full list for this metric, on the metrics page of the website, link or pixel.
  const getMoreUrl = () => {
    if (share) {
      return buildPath(`/share/${share.slug}/metrics`, { ...query, view: type });
    }

    const path = linkId
      ? `/links/${linkId}`
      : pixelId
        ? `/pixels/${pixelId}`
        : `/websites/${websiteId}`;

    return renderUrl(`${path}/metrics`, { view: type });
  };

  const renderLabel = (row: any) => {
    return filterLink ? <MetricLabel type={type} data={row} /> : row.label;
  };

  return (
    <LoadingPanel data={data} isFetching={isFetching} isLoading={isLoading} error={error}>
      <Grid>
        {data && <ListTable {...props} data={filteredData} renderLabel={renderLabel} />}
        {showMore && limit && (
          <Row justifyContent="end" paddingTop="4">
            <LinkButton href={getMoreUrl()} variant="ghost">
              <Row alignItems="center" gap="2">
                <Text>{t(labels.more)}</Text>
                <Icon>
                  <ArrowRight />
                </Icon>
              </Row>
            </LinkButton>
          </Row>
        )}
      </Grid>
    </LoadingPanel>
  );
}
