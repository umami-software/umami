import {
  Button,
  Column,
  DataColumn,
  DataTable,
  Heading,
  ListItem,
  Row,
  Select,
  Text,
  TextField,
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
import { COMMERCE_COLUMNS } from '@/lib/commerce-saved-reports';
import type { CommerceProduct } from '@/queries/sql/commerce/getCommerceProducts';
import { CommerceBaskets } from './CommerceBaskets';
import { CommerceProductDetail } from './CommerceProductDetail';
import { currencyFormatter, formatPercent } from './commerceUtils';

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
  return product ? (
    <CommerceProductDetail {...props} productId={product} />
  ) : (
    <CommerceProductList {...props} />
  );
}

export function ProductPerformanceTable({
  data,
  currency,
  groupBy = 'product',
  columns = [...COMMERCE_COLUMNS],
  linkToProduct,
}: {
  data: CommerceProduct[];
  currency: string;
  groupBy?: CommerceProductGroup;
  columns?: readonly string[];
  linkToProduct?: (productId: string) => string;
}) {
  const { t } = useMessages();
  const money = currencyFormatter(currency);
  return (
    <DataTable data={data}>
      <DataColumn id="name" label={t(`commerce.${groupBy}`)} width="minmax(180px, 2fr)">
        {(row: CommerceProduct) => {
          const label =
            groupBy === 'category'
              ? row.category || '—'
              : [row.name || row.productId, groupBy === 'variant' && row.variant]
                  .filter(Boolean)
                  .join(' · ');
          return linkToProduct && groupBy !== 'category' ? (
            <Link href={linkToProduct(row.productId)}>{label}</Link>
          ) : (
            <Text>{label}</Text>
          );
        }}
      </DataColumn>
      {COMMERCE_COLUMNS.filter(key => columns.includes(key)).map(key => (
        <DataColumn key={key} id={key} label={t(`commerce.${key}`)} align="end" width="120px">
          {(row: CommerceProduct) =>
            key.endsWith('Rate')
              ? formatPercent(row[key])
              : ['averagePrice', 'revenue'].includes(key)
                ? money(row[key])
                : row[key].toLocaleString()
          }
        </DataColumn>
      ))}
    </DataTable>
  );
}

function CommerceProductList({ websiteId, scope }: CommerceProductsProps) {
  const { t } = useMessages();
  const { router, updateParams, query } = useNavigation();
  const groupBy: CommerceProductGroup = COMMERCE_PRODUCT_GROUPS.includes(
    query.group as CommerceProductGroup,
  )
    ? (query.group as CommerceProductGroup)
    : 'product';
  const sort: CommerceProductSort = COMMERCE_PRODUCT_SORTS.includes(
    query.sort as CommerceProductSort,
  )
    ? (query.sort as CommerceProductSort)
    : 'revenue';
  const minViews = Math.max(0, Number(query.minViews) || 0);
  const maxCartRate = query.maxCartRate ? Math.max(0, Math.min(1, Number(query.maxCartRate))) : 1;
  const columns = query.columns
    ? query.columns.split(',').filter(key => COMMERCE_COLUMNS.includes(key as any))
    : [...COMMERCE_COLUMNS];
  const productsQuery = useCommerceProductsQuery(websiteId, {
    ...scope,
    groupBy,
    sort,
    minViews,
    maxCartRate,
  });
  const setParams = (params: Record<string, string | undefined>) =>
    router.replace(updateParams({ ...params, page: undefined }), { scroll: false });
  return (
    <Column gap>
      <Panel>
        <Heading size="2xl">{t('commerce.products')}</Heading>
        <Text color="muted">{t('commerce.productConversionHint')}</Text>
        <Row gap wrap="wrap">
          <Button
            onPress={() =>
              setParams({ sort: 'addToCartRate', minViews: '100', maxCartRate: undefined })
            }
          >
            {t('commerce.topCartRate')}
          </Button>
          <Button
            onPress={() => setParams({ sort: 'views', minViews: '100', maxCartRate: '0.05' })}
          >
            {t('commerce.lowCartRate')}
          </Button>
        </Row>
        <Row gap wrap="wrap">
          <Select
            label={t('commerce.groupBy')}
            value={groupBy}
            onChange={value => setParams({ group: String(value) })}
          >
            {COMMERCE_PRODUCT_GROUPS.map(id => (
              <ListItem key={id} id={id}>
                {t(`commerce.${id}`)}
              </ListItem>
            ))}
          </Select>
          <Select
            label={t('commerce.sortBy')}
            value={sort}
            onChange={value => setParams({ sort: String(value) })}
          >
            {COMMERCE_PRODUCT_SORTS.map(id => (
              <ListItem key={id} id={id}>
                {t(`commerce.${id}`)}
              </ListItem>
            ))}
          </Select>
          <TextField
            label={t('commerce.minimumViews')}
            type="number"
            min={0}
            value={String(minViews)}
            onChange={value => setParams({ minViews: String(value) })}
          />
          <TextField
            label={t('commerce.maximumCartRate')}
            type="number"
            min={0}
            max={100}
            value={String(maxCartRate * 100)}
            onChange={value => setParams({ maxCartRate: String(Number(value) / 100) })}
          />
          <TextField
            label={t('commerce.category')}
            value={scope.category || ''}
            onChange={value => setParams({ category: String(value) || undefined })}
          />
        </Row>
        <Row gap wrap="wrap">
          {COMMERCE_COLUMNS.map(key => (
            <Button
              key={key}
              variant={columns.includes(key) ? 'primary' : 'outline'}
              onPress={() => {
                const next = columns.includes(key)
                  ? columns.filter(column => column !== key)
                  : [...columns, key];
                if (next.length) setParams({ columns: next.join(',') });
              }}
            >
              {t(`commerce.${key}`)}
            </Button>
          ))}
        </Row>
        <DataGrid
          query={productsQuery}
          allowSearch
          allowPaging
          renderEmpty={() => <Empty message={t('commerce.noMatchingActivity')} />}
        >
          {({ data }) => (
            <ProductPerformanceTable
              data={data}
              currency={scope.currency}
              groupBy={groupBy}
              columns={columns}
              linkToProduct={productId =>
                updateParams({ product: productId, page: undefined, search: undefined })
              }
            />
          )}
        </DataGrid>
      </Panel>
      <CommerceBaskets websiteId={websiteId} scope={scope} />
    </Column>
  );
}
