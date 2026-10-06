import {
  Column,
  DataColumn,
  DataTable,
  Grid,
  Heading,
  Row,
  StatusLight,
  Text,
} from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { DataGrid } from '@/components/common/DataGrid';
import { DateDistance } from '@/components/common/DateDistance';
import { GridRow } from '@/components/common/GridRow';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type CommerceScope,
  useCommerceBuyersQuery,
  useCommerceCustomersQuery,
  useMessages,
  useNavigation,
  useShare,
} from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import type {
  CommerceBuyer,
  CommerceCustomers as CommerceCustomersData,
} from '@/queries/sql/commerce/getCommerceCustomers';
import { currencyFormatter, formatDecimal, formatDuration, formatPercent } from './commerceUtils';

export function CommerceCustomers({
  websiteId,
  scope,
}: {
  websiteId: string;
  scope: CommerceScope;
}) {
  const { t } = useMessages();
  const share = useShare();
  const { data, isLoading, isFetching, error } = useCommerceCustomersQuery(websiteId, scope);
  // Buyers are identified visitors; shares only list them when they expose Sessions.
  const shareParameters = share?.parameters;
  const hasSections = Object.entries(shareParameters ?? {}).some(
    ([key, value]) => key !== 'allowFilter' && typeof value === 'boolean',
  );
  const canListBuyers = !share || !hasSections || shareParameters?.sessions === true;

  return (
    <Column gap>
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        {data && (
          <Column gap>
            <CustomersMetricsBar data={data} currency={scope.currency} />
            <GridRow layout="two">
              <Panel>
                <Heading size="2xl">{t('commerce.revenue')}</Heading>
                <Grid padding="2">
                  <ListTable
                    title={t('commerce.buyers')}
                    metric={t('commerce.revenue')}
                    formatCount={currencyFormatter(scope.currency)}
                    data={[
                      {
                        label: t('commerce.newBuyers'),
                        count: data.newRevenue,
                        percent: data.revenue ? (data.newRevenue / data.revenue) * 100 : 0,
                      },
                      {
                        label: t('commerce.returningBuyers'),
                        count: data.returningRevenue,
                        percent: data.revenue ? (data.returningRevenue / data.revenue) * 100 : 0,
                      },
                    ]}
                  />
                </Grid>
              </Panel>
              <Panel>
                <Heading size="2xl">{t('commerce.buyers')}</Heading>
                <Grid padding="2">
                  <ListTable
                    title={t('commerce.buyers')}
                    metric={t('commerce.buyers')}
                    data={[
                      {
                        label: t('commerce.newBuyers'),
                        count: data.newBuyers,
                        percent: data.buyers ? (data.newBuyers / data.buyers) * 100 : 0,
                      },
                      {
                        label: t('commerce.returningBuyers'),
                        count: data.returningBuyers,
                        percent: data.buyers ? (data.returningBuyers / data.buyers) * 100 : 0,
                      },
                      {
                        label: t('commerce.repeatBuyers'),
                        count: data.repeatBuyers,
                        percent: data.repeatRate * 100,
                      },
                    ]}
                  />
                </Grid>
              </Panel>
            </GridRow>
          </Column>
        )}
      </LoadingPanel>
      {canListBuyers && (
        <Panel>
          <Heading size="2xl">{t('commerce.customers')}</Heading>
          <Text color="muted">{t('commerce.buyersHint')}</Text>
          <BuyersTable websiteId={websiteId} scope={scope} />
        </Panel>
      )}
    </Column>
  );
}

export function CustomersMetricsBar({
  data,
  currency,
}: {
  data: CommerceCustomersData;
  currency: string;
}) {
  const { t } = useMessages();
  const money = currencyFormatter(currency);
  const metrics = [
    { label: t('commerce.buyers'), value: data.buyers, format: formatLongNumber },
    { label: t('commerce.newBuyers'), value: data.newBuyers, format: formatLongNumber },
    { label: t('commerce.repeatRate'), value: data.repeatRate, format: formatPercent },
    { label: t('commerce.revenuePerBuyer'), value: data.revenuePerBuyer, format: money },
    { label: t('commerce.ordersPerBuyer'), value: data.ordersPerBuyer, format: formatDecimal },
    {
      label: t('commerce.timeToFirstPurchase'),
      value: data.medianSecondsToFirstOrder,
      format: formatDuration,
    },
    {
      label: t('commerce.visitsToFirstPurchase'),
      value: data.medianVisitsToFirstOrder,
      format: formatDecimal,
    },
  ];

  return (
    <MetricsBar>
      {metrics.map(({ label, value, format }) => (
        <MetricCard key={label} label={label} value={value} formatValue={format} />
      ))}
    </MetricsBar>
  );
}

function BuyersTable({ websiteId, scope }: { websiteId: string; scope: CommerceScope }) {
  const { t, labels } = useMessages();
  const { updateParams } = useNavigation();
  const queryResult = useCommerceBuyersQuery(websiteId, scope);
  const money = currencyFormatter(scope.currency);

  return (
    <DataGrid query={queryResult} allowSearch allowPaging>
      {({ data }) => (
        <DataTable data={data}>
          <DataColumn id="buyer" label={t('commerce.buyer')} width="minmax(200px, 2fr)">
            {(row: CommerceBuyer) => (
              <Link href={updateParams({ session: row.sessionId })} scroll={false}>
                <Row alignItems="center" gap="2" minWidth="0">
                  <Avatar seed={row.sessionId} size={24} />
                  <Text truncate title={row.buyerId}>
                    {row.distinctId || t(labels.session)}
                  </Text>
                </Row>
              </Link>
            )}
          </DataColumn>
          <DataColumn id="isNew" label={t(labels.type)} width="120px">
            {(row: CommerceBuyer) => (
              <StatusLight variant={row.isNew ? 'success' : 'info'}>
                {row.isNew ? t('commerce.new') : t('commerce.returning')}
              </StatusLight>
            )}
          </DataColumn>
          <DataColumn id="orders" label={t('commerce.orders')} align="end" width="90px">
            {(row: CommerceBuyer) => row.orders.toLocaleString()}
          </DataColumn>
          <DataColumn id="sessions" label={t(labels.sessions)} align="end" width="90px">
            {(row: CommerceBuyer) => row.sessions.toLocaleString()}
          </DataColumn>
          <DataColumn id="revenue" label={t('commerce.revenue')} align="end" width="130px">
            {(row: CommerceBuyer) => <Text weight="bold">{money(row.revenue)}</Text>}
          </DataColumn>
          <DataColumn id="lastOrderAt" label={t('commerce.lastOrder')} width="140px">
            {(row: CommerceBuyer) => <DateDistance date={new Date(row.lastOrderAt)} />}
          </DataColumn>
        </DataTable>
      )}
    </DataGrid>
  );
}
