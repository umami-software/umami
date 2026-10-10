import { DataColumn, DataTable, Text } from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { TypeIcon } from '@/components/common/TypeIcon';
import {
  type SearchConsoleDimension,
  type SearchConsoleRow,
  useFormat,
  useMessages,
  useSearchConsoleQuery,
} from '@/components/hooks';
import { toAlpha2 } from '@/lib/country-codes';
import { formatLongNumber } from '@/lib/format';

export interface SearchConsoleTableProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  dimension: Exclude<SearchConsoleDimension, 'date'>;
  limit?: number;
}

export function SearchConsoleTable({
  websiteId,
  startDate,
  endDate,
  dimension,
  limit = 20,
}: SearchConsoleTableProps) {
  const t = useTranslations('searchConsole');
  const { data, isLoading, error } = useSearchConsoleQuery({
    websiteId,
    startDate,
    endDate,
    dimension,
    limit,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="300px">
      {data?.rows?.length === 0 && <Empty />}
      {data?.rows?.length > 0 && (
        <DataTable data={data.rows}>
          {/* The header and each row are separate grids, so every column needs a size that does not
              depend on its contents, or the columns drift out of line. */}
          <DataColumn id="key" label={t(dimension)} width="minmax(120px, 1fr)">
            {(row: SearchConsoleRow) => <DimensionLabel dimension={dimension} value={row.key} />}
          </DataColumn>
          <DataColumn id="clicks" label={t('clicks')} align="end" width="90px">
            {(row: SearchConsoleRow) => formatLongNumber(row.clicks)}
          </DataColumn>
          <DataColumn id="impressions" label={t('impressions')} align="end" width="110px">
            {(row: SearchConsoleRow) => formatLongNumber(row.impressions)}
          </DataColumn>
          <DataColumn id="ctr" label={t('ctr')} align="end" width="80px">
            {(row: SearchConsoleRow) => `${(row.ctr * 100).toFixed(1)}%`}
          </DataColumn>
          <DataColumn id="position" label={t('position')} align="end" width="90px">
            {(row: SearchConsoleRow) => row.position.toFixed(1)}
          </DataColumn>
        </DataTable>
      )}
    </LoadingPanel>
  );
}

function DimensionLabel({
  dimension,
  value,
}: {
  dimension: SearchConsoleTableProps['dimension'];
  value: string;
}) {
  const { formatValue } = useFormat();
  const { t, labels } = useMessages();

  switch (dimension) {
    case 'page': {
      // Google reports full URLs; the path is what distinguishes pages within one website.
      let path = value;
      try {
        const url = new URL(value);
        path = `${url.pathname}${url.search}`;
      } catch {}

      return (
        <a href={value} target="_blank" rel="noopener noreferrer" title={value}>
          <Text truncate>{path}</Text>
        </a>
      );
    }
    case 'country': {
      // Google reports ISO alpha-3 codes ("usa"); Umami's names and flags use alpha-2.
      const code = toAlpha2(value);

      return (
        <TypeIcon type="country" value={code || 'xx'}>
          <Text truncate>{code ? formatValue(code, 'country') : t(labels.unknown)}</Text>
        </TypeIcon>
      );
    }
    case 'device': {
      const device = value.toLowerCase();

      return (
        <TypeIcon type="device" value={device}>
          <Text truncate>{formatValue(device, 'device')}</Text>
        </TypeIcon>
      );
    }
    default:
      return (
        <Text truncate title={value}>
          {value}
        </Text>
      );
  }
}
