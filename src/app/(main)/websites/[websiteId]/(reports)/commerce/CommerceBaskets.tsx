import { Grid, Heading } from '@umami/react-zen';
import { GridRow } from '@/components/common/GridRow';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type CommerceScope,
  useCommerceBasketsQuery,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';

/** Units per order and the products most often bought together. */
export function CommerceBaskets({
  websiteId,
  scope,
  productId,
}: {
  websiteId: string;
  scope: CommerceScope;
  productId?: string;
}) {
  const { t } = useMessages();
  const { updateParams } = useNavigation();
  const { data, isLoading, isFetching, error } = useCommerceBasketsQuery(websiteId, {
    ...scope,
    productId,
  });
  const totalOrders = (data?.sizes || []).reduce((sum, { orders }) => sum + orders, 0);
  const maxPair = Math.max(1, ...(data?.pairs || []).map(({ orders }) => orders));

  const pairs = (data?.pairs || []).map(pair => ({
    label: productId
      ? pair.pairedName || pair.pairedProductId
      : `${pair.name || pair.productId} + ${pair.pairedName || pair.pairedProductId}`,
    productId: productId ? pair.pairedProductId : undefined,
    count: pair.orders,
    percent: (pair.orders / maxPair) * 100,
  }));

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      <GridRow layout="two">
        {!productId && (
          <Panel>
            <Heading size="2xl">{t('commerce.basketSizes')}</Heading>
            <Grid padding="2">
              <ListTable
                title={t('commerce.units')}
                metric={t('commerce.orders')}
                data={(data?.sizes || []).map(({ size, orders }) => ({
                  label: size,
                  count: orders,
                  percent: totalOrders ? (orders / totalOrders) * 100 : 0,
                }))}
              />
            </Grid>
          </Panel>
        )}
        <Panel>
          <Heading size="2xl">
            {productId ? t('commerce.boughtWith') : t('commerce.boughtTogether')}
          </Heading>
          <Grid padding="2">
            <ListTable
              title={t('commerce.products')}
              metric={t('commerce.orders')}
              data={pairs}
              showPercentage={false}
              renderLabel={(row: any) =>
                row.productId ? (
                  <Link href={updateParams({ product: row.productId })}>{row.label}</Link>
                ) : (
                  row.label
                )
              }
            />
          </Grid>
        </Panel>
      </GridRow>
    </LoadingPanel>
  );
}
