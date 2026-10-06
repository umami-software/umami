import { Column, DataColumn, DataTable, Text } from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { DataGrid } from '@/components/common/DataGrid';
import { DateDistance } from '@/components/common/DateDistance';
import { Empty } from '@/components/common/Empty';
import Link from '@/components/common/Link';
import { TypeIcon } from '@/components/common/TypeIcon';
import {
  type CommerceScope,
  useCommerceOrdersQuery,
  useFormat,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import type { CommerceOrder } from '@/queries/sql/commerce/getCommerceOrders';
import { currencyFormatter } from './commerceUtils';

export function CommerceOrdersTable({
  websiteId,
  scope,
}: {
  websiteId: string;
  scope: CommerceScope;
}) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { updateParams } = useNavigation();
  const queryResult = useCommerceOrdersQuery(websiteId, scope);
  const money = currencyFormatter(scope.currency);

  return (
    <DataGrid
      query={queryResult}
      allowSearch
      allowPaging
      renderEmpty={() => <Empty message={t('commerce.noOrders')} />}
    >
      {({ data }) => (
        <DataTable data={data}>
          <DataColumn id="orderId" label={t('commerce.orderId')} width="minmax(140px, 1.2fr)">
            {(row: CommerceOrder) => (
              <Link href={updateParams({ order: row.id })} scroll={false}>
                <Text truncate title={row.orderId} weight="bold">
                  {row.orderId}
                </Text>
              </Link>
            )}
          </DataColumn>
          <DataColumn id="createdAt" label={t(labels.date)} width="140px">
            {(row: CommerceOrder) => <DateDistance date={new Date(row.createdAt)} />}
          </DataColumn>
          <DataColumn id="eventName" label={t('commerce.orderEvent')} width="minmax(120px, 1fr)">
            {(row: CommerceOrder) => (
              <Text truncate title={row.eventName}>
                {row.eventName}
              </Text>
            )}
          </DataColumn>
          <DataColumn id="market" label={t('commerce.market')} width="100px">
            {(row: CommerceOrder) => row.market || '—'}
          </DataColumn>
          <DataColumn id="units" label={t('commerce.units')} align="end" width="80px">
            {(row: CommerceOrder) => row.units.toLocaleString()}
          </DataColumn>
          <DataColumn id="total" label={t(labels.total)} align="end" width="120px">
            {(row: CommerceOrder) => <Text weight="bold">{money(row.total)}</Text>}
          </DataColumn>
          <DataColumn id="country" label={t(labels.location)} width="160px">
            {(row: CommerceOrder) => (
              <TypeIcon type="country" value={row.country}>
                {formatValue(row.country, 'country')}
              </TypeIcon>
            )}
          </DataColumn>
          <DataColumn id="device" label={t(labels.device)} width="130px">
            {(row: CommerceOrder) => (
              <TypeIcon type="device" value={row.device}>
                {formatValue(row.device, 'device')}
              </TypeIcon>
            )}
          </DataColumn>
          <DataColumn id="session" label={t(labels.session)} width="80px">
            {(row: CommerceOrder) => (
              <Column>
                <Link href={updateParams({ session: row.sessionId })} scroll={false}>
                  <Avatar seed={row.sessionId} size={28} />
                </Link>
              </Column>
            )}
          </DataColumn>
        </DataTable>
      )}
    </DataGrid>
  );
}
