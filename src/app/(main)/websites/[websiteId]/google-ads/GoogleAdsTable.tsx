import { Column, DataColumn, DataTable, Text } from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  type GoogleAdsDimension,
  type GoogleAdsRow,
  useGoogleAdsQuery,
  useLocale,
  useMobile,
} from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import { formatConversions, formatMoney, formatPercent, getCtr, NO_VALUE } from './format';

export interface GoogleAdsTableProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  dimension: Exclude<GoogleAdsDimension, 'date' | 'conversion_action'>;
  limit?: number;
}

const DIMENSION_LABELS = {
  campaign: 'campaign',
  ad_group: 'adGroup',
  keyword: 'keyword',
} as const;

const MATCH_TYPE_LABELS = {
  EXACT: 'matchExact',
  PHRASE: 'matchPhrase',
  BROAD: 'matchBroad',
} as const;

export function GoogleAdsTable({
  websiteId,
  startDate,
  endDate,
  dimension,
  limit = 20,
}: GoogleAdsTableProps) {
  const t = useTranslations('googleAds');
  const { locale } = useLocale();
  const { isPhone } = useMobile();
  const { data, isLoading, error } = useGoogleAdsQuery({
    websiteId,
    startDate,
    endDate,
    dimension,
    limit,
  });
  const currency = data?.currencyCode ?? null;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="300px">
      {data?.rows?.length === 0 && <Empty />}
      {data?.rows?.length > 0 && (
        // Eight columns do not fit a phone, and the page clips rather than scrolls sideways.
        <DataTable data={data.rows} displayMode={isPhone ? 'cards' : 'table'}>
          {/* The header and each row are separate grids, so every column needs a size that does not
              depend on its contents, or the columns drift out of line. */}
          <DataColumn id="name" label={t(DIMENSION_LABELS[dimension])} width="minmax(160px, 1fr)">
            {(row: GoogleAdsRow) => <RowName row={row} />}
          </DataColumn>
          <DataColumn id="cost" label={t('cost')} align="end" width="100px">
            {(row: GoogleAdsRow) => formatMoney(row.cost, currency, locale)}
          </DataColumn>
          <DataColumn id="clicks" label={t('clicks')} align="end" width="90px">
            {(row: GoogleAdsRow) => formatLongNumber(row.clicks)}
          </DataColumn>
          <DataColumn id="impressions" label={t('impressions')} align="end" width="110px">
            {(row: GoogleAdsRow) => formatLongNumber(row.impressions)}
          </DataColumn>
          <DataColumn id="ctr" label={t('ctr')} align="end" width="80px">
            {(row: GoogleAdsRow) => formatPercent(getCtr(row))}
          </DataColumn>
          <DataColumn id="conversions" label={t('conversions')} align="end" width="110px">
            {(row: GoogleAdsRow) => formatConversions(row.conversions)}
          </DataColumn>
          <DataColumn
            id="costPerConversion"
            label={t('costPerConversion')}
            align="end"
            width="110px"
          >
            {(row: GoogleAdsRow) =>
              row.conversions ? formatMoney(row.cost / row.conversions, currency, locale) : NO_VALUE
            }
          </DataColumn>
          <DataColumn id="conversionsValue" label={t('conversionValue')} align="end" width="140px">
            {(row: GoogleAdsRow) => formatMoney(row.conversionsValue, currency, locale)}
          </DataColumn>
        </DataTable>
      )}
    </LoadingPanel>
  );
}

function RowName({ row }: { row: GoogleAdsRow }) {
  const t = useTranslations('googleAds');
  // Cards size to their content, so a name that cannot wrap would push them past the panel.
  const { isPhone } = useMobile();
  const matchLabel = MATCH_TYPE_LABELS[row.matchType as keyof typeof MATCH_TYPE_LABELS];
  const details = [row.parent, matchLabel && t(matchLabel)].filter(Boolean).join(' · ');

  return (
    <Column overflow="hidden" minWidth="0" width="100%">
      <Text truncate={!isPhone} title={row.name}>
        {row.name}
      </Text>
      {details && (
        <Text truncate={!isPhone} size="sm" color="muted" title={details}>
          {details}
        </Text>
      )}
    </Column>
  );
}
