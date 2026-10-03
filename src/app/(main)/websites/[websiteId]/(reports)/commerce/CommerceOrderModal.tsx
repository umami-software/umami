'use client';
import {
  Button,
  Column,
  DataColumn,
  DataTable,
  Dialog,
  Grid,
  Modal,
  Row,
  Text,
} from '@umami/react-zen';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useCommerceOrderQuery, useMessages, useNavigation } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { currencyFormatter } from './commerceUtils';

/** Order details with items, opened by the `order` URL parameter. */
export function CommerceOrderModal({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const {
    router,
    query: { order },
    updateParams,
  } = useNavigation();
  const { data, isLoading, error } = useCommerceOrderQuery(websiteId, order);
  const money = currencyFormatter(data?.currency);

  const close = () => router.replace(updateParams({ order: undefined }), { scroll: false });

  const summary = data
    ? [
        [t('commerce.subtotal'), money(data.subtotal)],
        [t('commerce.shipping'), money(data.shipping)],
        [t('commerce.tax'), money(data.tax)],
        [t(labels.total), money(data.total)],
      ]
    : [];

  return (
    <ControlledDialog>
      <Modal isOpen={!!order} onOpenChange={isOpen => !isOpen && close()}>
        <Dialog
          title={
            data?.orderId ? `${t('commerce.order')} ${data.orderId}` : t('commerce.orderDetails')
          }
          style={{ width: 760, maxWidth: '95vw' }}
        >
          <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="200px">
            {data && (
              <Column gap="6">
                <Grid columns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap>
                  <Detail
                    label={t(labels.date)}
                    value={formatDate(new Date(data.createdAt), 'PPpp')}
                  />
                  <Detail label={t('commerce.orderEvent')} value={data.eventName} />
                  <Detail label={t('commerce.market')} value={data.market || '—'} />
                  {data.checkoutId && (
                    <Detail label={t('commerce.checkout')} value={data.checkoutId} />
                  )}
                  {data.cartId && <Detail label={t('commerce.cart')} value={data.cartId} />}
                  <Detail label={t(labels.currency)} value={data.currency} />
                </Grid>
                <DataTable data={data.items}>
                  <DataColumn
                    id="productId"
                    label={t('commerce.product')}
                    width="minmax(160px, 2fr)"
                  >
                    {(row: any) => (
                      <Column>
                        <Text weight="bold" truncate title={row.name || row.productId}>
                          {row.name || row.productId}
                        </Text>
                        <Text color="muted" size="sm" truncate>
                          {[row.productId, row.variant, row.category].filter(Boolean).join(' · ')}
                        </Text>
                      </Column>
                    )}
                  </DataColumn>
                  <DataColumn id="price" label={t('commerce.price')} align="end" width="110px">
                    {(row: any) => money(row.price)}
                  </DataColumn>
                  <DataColumn
                    id="quantity"
                    label={t('commerce.quantity')}
                    align="end"
                    width="90px"
                  />
                  <DataColumn id="total" label={t(labels.total)} align="end" width="120px">
                    {(row: any) => money(row.total)}
                  </DataColumn>
                </DataTable>
                <Column gap="1" alignItems="flex-end">
                  {summary.map(([label, value], index) => (
                    <Row key={label} gap="6" justifyContent="flex-end">
                      <Text color="muted">{label}</Text>
                      <Text weight={index === summary.length - 1 ? 'bold' : undefined}>
                        {value}
                      </Text>
                    </Row>
                  ))}
                </Column>
                <Row justifyContent="space-between" gap>
                  <Button
                    onPress={() =>
                      router.replace(updateParams({ order: undefined, session: data.sessionId }), {
                        scroll: false,
                      })
                    }
                  >
                    {t('commerce.viewSession')}
                  </Button>
                  <Button variant="primary" onPress={close}>
                    {t(labels.close)}
                  </Button>
                </Row>
              </Column>
            )}
          </LoadingPanel>
        </Dialog>
      </Modal>
    </ControlledDialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Column gap="1" minWidth="0">
      <Text color="muted" size="sm">
        {label}
      </Text>
      <Text truncate title={value}>
        {value}
      </Text>
    </Column>
  );
}
