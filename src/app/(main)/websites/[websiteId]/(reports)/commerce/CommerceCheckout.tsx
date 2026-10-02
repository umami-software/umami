import {
  Box,
  Column,
  DataColumn,
  DataTable,
  Grid,
  Heading,
  Icon,
  ProgressBar,
  Row,
  Text,
} from '@umami/react-zen';
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
import { CreditCard, ShoppingBag, ShoppingCart, User } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import type {
  CommerceAbandonedCheckout,
  CommerceCheckout as CommerceCheckoutData,
} from '@/queries/sql/commerce/getCommerceCheckout';
import { currencyFormatter, formatDuration, formatPercent } from './commerceUtils';

const STAGE_ICONS = {
  cart: <ShoppingCart />,
  checkout: <ShoppingBag />,
  order: <CreditCard />,
};

export function CommerceCheckout({
  websiteId,
  scope,
}: {
  websiteId: string;
  scope: CommerceScope;
}) {
  const { t } = useMessages();
  const { data, isLoading, isFetching, error } = useCommerceCheckoutQuery(websiteId, scope);

  return (
    <Column gap>
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
  const stageLabels = {
    cart: t('commerce.stageCart'),
    checkout: t('commerce.stageCheckout'),
    order: t('commerce.stageOrder'),
  };

  return (
    <Column gap="6" paddingTop="4">
      {data.stages.map(({ stage, sessions, rate, stepRate }, index) => {
        const previous = index > 0 ? data.stages[index - 1].sessions : sessions;
        const dropped = previous - sessions;

        return (
          <Grid key={stage} columns="auto 1fr" gap="6">
            <Column alignItems="center" position="relative">
              <Row
                borderRadius="full"
                backgroundColor="surface-sunken"
                width="40px"
                height="40px"
                justifyContent="center"
                alignItems="center"
                style={{ zIndex: 1 }}
              >
                <Icon>{STAGE_ICONS[stage]}</Icon>
              </Row>
              {index > 0 && (
                <Box
                  position="absolute"
                  backgroundColor="surface-sunken"
                  width="2px"
                  height="120px"
                  top="-100%"
                />
              )}
            </Column>
            <Column gap>
              <Row alignItems="center" justifyContent="space-between" gap>
                <Text weight="bold">{stageLabels[stage]}</Text>
                <Row alignItems="center" gap>
                  {index > 0 && dropped > 0 && (
                    <ChangeLabel value={-dropped} title={formatPercent(1 - stepRate)}>
                      {formatLongNumber(dropped)}
                    </ChangeLabel>
                  )}
                  <Icon>
                    <User />
                  </Icon>
                  <Text>{`${formatLongNumber(sessions)} ${t('commerce.reachedStage').toLowerCase()}`}</Text>
                </Row>
              </Row>
              <Row alignItems="center" gap="6">
                <ProgressBar
                  value={sessions}
                  min={0}
                  max={previous || 1}
                  style={{ width: '100%' }}
                />
                <Row minWidth="90px" justifyContent="end">
                  <Text weight="bold" size="4xl">
                    {formatPercent(rate)}
                  </Text>
                </Row>
              </Row>
            </Column>
          </Grid>
        );
      })}
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
