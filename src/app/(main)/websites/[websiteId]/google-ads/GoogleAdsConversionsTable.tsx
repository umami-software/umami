import { Column, DataColumn, DataTable, Text } from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { type GoogleAdsRow, useGoogleAdsQuery, useLocale, useMobile } from '@/components/hooks';
import { formatConversions, formatEnum, formatMoney } from './format';

export interface GoogleAdsConversionsTableProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  limit?: number;
}

/** Conversions per conversion action, as on Google's "All conversions" page. */
export function GoogleAdsConversionsTable({
  websiteId,
  startDate,
  endDate,
  limit = 50,
}: GoogleAdsConversionsTableProps) {
  const t = useTranslations('googleAds');
  const { locale } = useLocale();
  const { isPhone } = useMobile();
  const { data, isLoading, error } = useGoogleAdsQuery({
    websiteId,
    startDate,
    endDate,
    dimension: 'conversion_action',
    limit,
  });
  const currency = data?.currencyCode ?? null;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="200px">
      {data?.rows?.length === 0 && <Empty />}
      {data?.rows?.length > 0 && (
        <DataTable data={data.rows} displayMode={isPhone ? 'cards' : 'table'}>
          {/* The header and each row are separate grids, so every column needs a size that does not
              depend on its contents, or the columns drift out of line. */}
          <DataColumn id="name" label={t('conversionAction')} width="minmax(160px, 1fr)">
            {(row: GoogleAdsRow) => <ActionName row={row} />}
          </DataColumn>
          <DataColumn id="conversions" label={t('conversions')} align="end" width="120px">
            {(row: GoogleAdsRow) => formatConversions(row.conversions)}
          </DataColumn>
          <DataColumn id="conversionsValue" label={t('conversionValue')} align="end" width="150px">
            {(row: GoogleAdsRow) => formatMoney(row.conversionsValue, currency, locale)}
          </DataColumn>
          <DataColumn id="allConversions" label={t('allConversions')} align="end" width="120px">
            {(row: GoogleAdsRow) => formatConversions(row.allConversions)}
          </DataColumn>
          <DataColumn
            id="allConversionsValue"
            label={t('allConversionsValue')}
            align="end"
            width="150px"
          >
            {(row: GoogleAdsRow) => formatMoney(row.allConversionsValue, currency, locale)}
          </DataColumn>
        </DataTable>
      )}
    </LoadingPanel>
  );
}

function ActionName({ row }: { row: GoogleAdsRow }) {
  // Cards size to their content, so a name that cannot wrap would push them past the panel.
  const { isPhone } = useMobile();
  const category = row.parent ? formatEnum(row.parent) : null;

  return (
    <Column overflow="hidden" minWidth="0" width="100%">
      <Text truncate={!isPhone} title={row.name}>
        {row.name}
      </Text>
      {category && (
        <Text truncate={!isPhone} size="sm" color="muted">
          {category}
        </Text>
      )}
    </Column>
  );
}
