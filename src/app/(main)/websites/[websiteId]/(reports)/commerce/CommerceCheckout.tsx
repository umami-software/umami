import { Column, DataColumn, DataTable, Heading, Text, TextField } from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { DataGrid } from '@/components/common/DataGrid';
import { DateDistance } from '@/components/common/DateDistance';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { TypeIcon } from '@/components/common/TypeIcon';
import {
  type CommerceScope,
  useCommerceAbandonedQuery,
  useCommerceCheckoutQuery,
  useFormat,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import type {
  CommerceAbandonedCheckout,
  CommerceCheckout as CommerceCheckoutData,
} from '@/queries/sql/commerce/getCommerceCheckout';
import { currencyFormatter, formatDuration, formatPercent } from './commerceUtils';

export function CommerceCheckout({
  websiteId,
  scope,
}: {
  websiteId: string;
  scope: CommerceScope;
}) {
  const { t } = useMessages();
  const { router, updateParams } = useNavigation();
  const { data, isLoading, isFetching, error } = useCommerceCheckoutQuery(websiteId, scope);

  return (
    <Column gap>
      <TextField
        label={t('commerce.windowHours')}
        type="number"
        min={1}
        max={720}
        value={String(scope.windowHours || data?.windowHours || 24)}
        onChange={value =>
          router.replace(updateParams({ windowHours: String(value), page: undefined }), {
            scroll: false,
          })
        }
      />
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        {data && (
          <Column gap>
            <CheckoutMetricsBar data={data} currency={scope.currency} />
            <Panel>
              <Heading size="2xl">{t('commerce.checkout')}</Heading>
              <Text color="muted">{t('commerce.stagesHint')}</Text>
              <CheckoutStages data={data} />
            </Panel>
          </Column>
        )}
      </LoadingPanel>
      <Panel>
        <Heading size="2xl">{t('commerce.abandoned')}</Heading>
        <AbandonedTable websiteId={websiteId} scope={scope} />
      </Panel>
    </Column>
  );
}

export function CheckoutMetricsBar({
  data,
  currency,
}: {
  data: CommerceCheckoutData;
  currency: string;
}) {
  const { t } = useMessages();
  const money = currencyFormatter(currency);
  const metrics = [
    { label: t('commerce.abandonedCarts'), value: data.abandonedCarts, format: formatLongNumber },
    {
      label: t('commerce.abandonedCheckouts'),
      value: data.abandonedCheckouts,
      format: formatLongNumber,
    },
    {
      label: t('commerce.abandonedValue'),
      value: data.abandonedCartValue + data.abandonedCheckoutValue,
      format: money,
    },
    {
      label: t('commerce.medianTimeToOrder'),
      value: data.medianSecondsToOrder,
      format: formatDuration,
    },
    {
      label: t('commerce.medianCheckoutToOrder'),
      value: data.medianSecondsCheckoutToOrder,
      format: formatDuration,
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

export function CheckoutStages({ data }: { data: CommerceCheckoutData }) {
  const { t } = useMessages();
  const metrics = [
    ['observedCarts', data.stages[0]?.sessions || 0],
    ['observedCheckouts', data.stages[1]?.sessions || 0],
    ['completedCheckouts', data.completedCheckouts],
    ['pendingCarts', data.pendingCarts],
    ['pendingCheckouts', data.pendingCheckouts],
    ['unlinkedEvents', data.unlinkedEvents],
    ['unclassifiedEvents', data.unclassifiedEvents],
  ] as const;
  return (
    <Column gap>
      <MetricsBar>
        {metrics.map(([label, value]) => (
          <MetricCard
            key={label}
            label={t(`commerce.${label}`)}
            value={value}
            formatValue={formatLongNumber}
          />
        ))}
      </MetricsBar>
      <Text>
        {t('commerce.checkoutRate')}: {formatPercent(data.stages[2]?.rate || 0)}
      </Text>
      <Text color="muted">{t('commerce.attemptHint', { hours: data.windowHours })}</Text>
    </Column>
  );
}

function AbandonedTable({ websiteId, scope }: { websiteId: string; scope: CommerceScope }) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { updateParams } = useNavigation();
  const queryResult = useCommerceAbandonedQuery(websiteId, scope);
  const money = currencyFormatter(scope.currency);

  return (
    <DataGrid query={queryResult} allowPaging>
      {({ data }) => (
        <DataTable data={data}>
          <DataColumn id="session" label={t(labels.session)} width="80px">
            {(row: CommerceAbandonedCheckout) => (
              <Link href={updateParams({ session: row.sessionId })} scroll={false}>
                <Avatar seed={row.sessionId} size={28} />
              </Link>
            )}
          </DataColumn>
          <DataColumn id="stage" label={t('commerce.stage')} width="120px">
            {(row: CommerceAbandonedCheckout) =>
              row.stage === 'checkout' ? t('commerce.checkout') : t('commerce.cart')
            }
          </DataColumn>
          <DataColumn id="id" label={t('commerce.reference')} width="minmax(120px, 1fr)">
            {(row: CommerceAbandonedCheckout) => (
              <Text truncate title={row.checkoutId || row.cartId}>
                {row.checkoutId || row.cartId || '—'}
              </Text>
            )}
          </DataColumn>
          <DataColumn id="units" label={t('commerce.units')} align="end" width="80px">
            {(row: CommerceAbandonedCheckout) => row.units.toLocaleString()}
          </DataColumn>
          <DataColumn id="value" label={t('commerce.subtotal')} align="end" width="120px">
            {(row: CommerceAbandonedCheckout) => <Text weight="bold">{money(row.value)}</Text>}
          </DataColumn>
          <DataColumn id="country" label={t(labels.location)} width="160px">
            {(row: CommerceAbandonedCheckout) => (
              <TypeIcon type="country" value={row.country}>
                {formatValue(row.country, 'country')}
              </TypeIcon>
            )}
          </DataColumn>
          <DataColumn id="device" label={t(labels.device)} width="130px">
            {(row: CommerceAbandonedCheckout) => (
              <TypeIcon type="device" value={row.device}>
                {formatValue(row.device, 'device')}
              </TypeIcon>
            )}
          </DataColumn>
          <DataColumn id="lastAt" label={t('commerce.lastActivity')} width="140px">
            {(row: CommerceAbandonedCheckout) => <DateDistance date={new Date(row.lastAt)} />}
          </DataColumn>
        </DataTable>
      )}
    </DataGrid>
  );
}
