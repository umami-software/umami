import {
  Column,
  DataColumn,
  DataTable,
  Heading,
  ListItem,
  Row,
  Select,
  Text,
} from '@umami/react-zen';
import { DataGrid } from '@/components/common/DataGrid';
import { Empty } from '@/components/common/Empty';
import Link from '@/components/common/Link';
import { Panel } from '@/components/common/Panel';
import {
  type CommerceScope,
  useCommerceProductsQuery,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import {
  COMMERCE_PRODUCT_GROUPS,
  COMMERCE_PRODUCT_SORTS,
  type CommerceProductGroup,
  type CommerceProductSort,
} from '@/lib/commerce-reports';
import type { CommerceProduct } from '@/queries/sql/commerce/getCommerceProducts';
import { CommerceBaskets } from './CommerceBaskets';
import { CommerceProductDetail } from './CommerceProductDetail';
import { currencyFormatter } from './commerceUtils';

export interface CommerceProductsProps {
  websiteId: string;
  scope: CommerceScope;
  startDate: Date;
  endDate: Date;
  unit: string;
}

export function CommerceProducts(props: CommerceProductsProps) {
  const {
    query: { product },
  } = useNavigation();

  if (product) {
    return <CommerceProductDetail {...props} productId={product} />;
  }

  return <CommerceProductList {...props} />;
}

function CommerceProductList({ websiteId, scope }: CommerceProductsProps) {
  const { t } = useMessages();
  const { router, updateParams, query } = useNavigation();
  const groupBy: CommerceProductGroup = (COMMERCE_PRODUCT_GROUPS as readonly string[]).includes(
    query.group,
  )
    ? (query.group as CommerceProductGroup)
    : 'product';
  const sort: CommerceProductSort = (COMMERCE_PRODUCT_SORTS as readonly string[]).includes(
    query.sort,
  )
    ? (query.sort as CommerceProductSort)
    : 'revenue';
  const productsQuery = useCommerceProductsQuery(websiteId, { ...scope, groupBy, sort });
  const money = currencyFormatter(scope.currency);

  const setParam = (key: string, value: string) =>
    router.replace(updateParams({ [key]: value, page: undefined }), { scroll: false });

  const groupLabels: Record<CommerceProductGroup, string> = {
    product: t('commerce.product'),
    variant: t('commerce.variant'),
    category: t('commerce.category'),
  };
  const sortLabels: Record<CommerceProductSort, string> = {
    revenue: t('commerce.revenue'),
    units: t('commerce.units'),
    orders: t('commerce.orders'),
  };

  return (
    <Column gap>
      <Panel>
        <Row justifyContent="space-between" alignItems="center" wrap="wrap" gap>
          <Heading size="2xl">{t('commerce.products')}</Heading>
          <Row gap>
            <Select
              label={t('commerce.groupBy')}
              value={groupBy}
              onChange={value => setParam('group', String(value))}
              buttonProps={{ style: { width: 160 } }}
            >
              {COMMERCE_PRODUCT_GROUPS.map(id => (
                <ListItem key={id} id={id}>
                  {groupLabels[id]}
                </ListItem>
              ))}
            </Select>
            <Select
              label={t('commerce.sortBy')}
              value={sort}
              onChange={value => setParam('sort', String(value))}
              buttonProps={{ style: { width: 160 } }}
            >
              {COMMERCE_PRODUCT_SORTS.map(id => (
                <ListItem key={id} id={id}>
                  {sortLabels[id]}
                </ListItem>
              ))}
            </Select>
          </Row>
        </Row>
        <DataGrid
          query={productsQuery}
          allowSearch
          allowPaging
          renderEmpty={() => <Empty message={t('commerce.noOrders')} />}
        >
          {({ data }) => (
            <DataTable data={data}>
              <DataColumn id="name" label={groupLabels[groupBy]} width="minmax(200px, 2fr)">
                {(row: CommerceProduct) =>
                  groupBy === 'category' ? (
                    <Text weight="bold">{row.category || '—'}</Text>
                  ) : (
                    <Column minWidth="0">
                      <Link
                        href={updateParams({
                          product: row.productId,
                          page: undefined,
                          search: undefined,
                        })}
                      >
                        <Text weight="bold" truncate title={row.name || row.productId}>
                          {row.name || row.productId}
                        </Text>
                      </Link>
                      <Text color="muted" size="sm" truncate>
                        {[row.productId, groupBy === 'variant' && row.variant, row.category]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </Column>
                  )
                }
              </DataColumn>
              <DataColumn id="units" label={t('commerce.units')} align="end" width="100px">
                {(row: CommerceProduct) => row.units.toLocaleString()}
              </DataColumn>
              <DataColumn id="orders" label={t('commerce.orders')} align="end" width="100px">
                {(row: CommerceProduct) => row.orders.toLocaleString()}
              </DataColumn>
              <DataColumn
                id="averagePrice"
                label={t('commerce.averagePrice')}
                align="end"
                width="120px"
              >
                {(row: CommerceProduct) => money(row.averagePrice)}
              </DataColumn>
              <DataColumn id="revenue" label={t('commerce.revenue')} align="end" width="130px">
                {(row: CommerceProduct) => <Text weight="bold">{money(row.revenue)}</Text>}
              </DataColumn>
            </DataTable>
          )}
        </DataGrid>
      </Panel>
      <CommerceBaskets websiteId={websiteId} scope={scope} />
    </Column>
  );
}
