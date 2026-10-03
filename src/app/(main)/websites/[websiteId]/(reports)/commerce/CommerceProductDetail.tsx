import { Button, Column, Heading, Icon, Row, Text } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type CommerceScope,
  useCommerceChartQuery,
  useCommerceProductsQuery,
  useCommerceStatsQuery,
  useDateRange,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';
import { RevenueChart } from '../revenue/RevenueChart';
import { CommerceBaskets } from './CommerceBaskets';
import { CommerceMetricsBar } from './CommerceMetricsBar';
import { CommerceMetricsTable } from './CommerceMetricsTable';

export interface CommerceProductDetailProps {
  websiteId: string;
  scope: CommerceScope;
  productId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

/** One product: line revenue and units, its trend, companions, sources and locations. */
export function CommerceProductDetail({
  websiteId,
  scope,
  productId,
  startDate,
  endDate,
  unit,
}: CommerceProductDetailProps) {
  const { t, labels } = useMessages();
  const { compare } = useDateRange();
  const { router, updateParams } = useNavigation();
  const productScope = { ...scope, productId };
  const statsQuery = useCommerceStatsQuery(websiteId, { ...productScope, compare });
  const chartQuery = useCommerceChartQuery(websiteId, productScope);
  const { data: products } = useCommerceProductsQuery(websiteId, productScope);
  const name = products?.data?.[0]?.name;

  return (
    <Column gap>
      <Row alignItems="center" gap="3">
        <Button
          variant="quiet"
          onPress={() =>
            router.replace(
              updateParams({ product: undefined, page: undefined, search: undefined }),
              {
                scroll: false,
              },
            )
          }
        >
          <Icon>
            <ArrowLeft />
          </Icon>
          <Text>{t('commerce.backToProducts')}</Text>
        </Button>
        <Column minWidth="0">
          <Heading size="2xl">{name || productId}</Heading>
          {name && <Text color="muted">{productId}</Text>}
        </Column>
      </Row>
      <LoadingPanel
        data={statsQuery.data}
        isLoading={statsQuery.isLoading}
        isFetching={statsQuery.isFetching}
        error={statsQuery.error}
      >
        {statsQuery.data && (
          <CommerceMetricsBar data={statsQuery.data} currency={scope.currency} variant="product" />
        )}
      </LoadingPanel>
      <Panel>
        <LoadingPanel
          data={chartQuery.data}
          isLoading={chartQuery.isLoading}
          isFetching={chartQuery.isFetching}
          error={chartQuery.error}
          minHeight="400px"
        >
          {chartQuery.data && (
            <RevenueChart
              data={chartQuery.data.chart}
              unit={unit}
              minDate={startDate}
              maxDate={endDate}
              currency={scope.currency}
            />
          )}
        </LoadingPanel>
      </Panel>
      <CommerceBaskets websiteId={websiteId} scope={scope} productId={productId} />
      <GridRow layout="two">
        <Panel>
          <Heading size="2xl">{t(labels.channels)}</Heading>
          <CommerceMetricsTable
            websiteId={websiteId}
            scope={productScope}
            type="channel"
            title={t(labels.channel)}
          />
        </Panel>
        <Panel>
          <Heading size="2xl">{t(labels.countries)}</Heading>
          <CommerceMetricsTable
            websiteId={websiteId}
            scope={productScope}
            type="country"
            title={t(labels.country)}
          />
        </Panel>
      </GridRow>
    </Column>
  );
}
