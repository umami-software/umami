import {
  Button,
  Column,
  DataColumn,
  DataTable,
  Icon,
  Row,
  SearchField,
  Text,
} from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import { SortableLabel } from '@/components/common/SortableLabel';
import {
  type GoogleAdsDimension,
  type GoogleAdsRow,
  useGoogleAdsQuery,
  useLocale,
  useMessages,
  useMobile,
} from '@/components/hooks';
import { X } from '@/components/icons';
import { formatLongNumber } from '@/lib/format';
import {
  formatConversions,
  formatEnum,
  formatMoney,
  formatPercent,
  getCtr,
  NO_VALUE,
} from './format';

/** A campaign or ad group the tables below it are narrowed to. */
export interface GoogleAdsTableFilter {
  type: 'campaign' | 'adGroup';
  id: string;
  name: string;
}

export interface GoogleAdsTableProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  dimension: Exclude<GoogleAdsDimension, 'date' | 'conversion_action'>;
  filter?: GoogleAdsTableFilter | null;
  onClearFilter?: () => void;
  /** Makes each row's name a button that opens the level below it. */
  onDrill?: (row: GoogleAdsRow) => void;
}

// Google returns the rows with the highest cost, up to its limit; sorting, search and paging
// then work on those rows without asking Google again.
const ROW_LIMIT = 1000;
const PAGE_SIZE = 20;

const DIMENSION_LABELS = {
  campaign: 'campaign',
  ad_group: 'adGroup',
  keyword: 'keyword',
  search_term: 'searchTerm',
  landing_page: 'landingPage',
  device: 'device',
  network: 'network',
} as const;

const DRILL_LABELS: Partial<
  Record<GoogleAdsTableProps['dimension'], 'viewAdGroups' | 'viewKeywords'>
> = {
  campaign: 'viewAdGroups',
  ad_group: 'viewKeywords',
};

// Dimensions that sit below a campaign or an ad group, and so can be narrowed to one.
const BELOW_CAMPAIGN = new Set<string>(['ad_group', 'keyword', 'search_term']);
const BELOW_AD_GROUP = new Set<string>(['keyword', 'search_term']);

/** Google's enum values for devices and networks, under the names its own reports use. */
const VALUE_LABELS = {
  device: {
    MOBILE: 'deviceMobile',
    DESKTOP: 'deviceDesktop',
    TABLET: 'deviceTablet',
    CONNECTED_TV: 'deviceTv',
  },
  network: {
    SEARCH: 'networkSearch',
    SEARCH_PARTNERS: 'networkSearchPartners',
    CONTENT: 'networkDisplay',
    YOUTUBE: 'networkYouTube',
    MIXED: 'networkMixed',
  },
} as const;

const MATCH_TYPE_LABELS = {
  EXACT: 'matchExact',
  PHRASE: 'matchPhrase',
  BROAD: 'matchBroad',
} as const;

const STATUS_LABELS = {
  PAUSED: 'statusPaused',
  REMOVED: 'statusRemoved',
} as const;

type SortKey =
  | 'name'
  | 'cost'
  | 'clicks'
  | 'impressions'
  | 'ctr'
  | 'conversions'
  | 'costPerConversion'
  | 'conversionsValue';

type SortDirection = 'asc' | 'desc';

/** Null for a ratio with nothing to divide by; those rows sort last in either direction. */
const SORT_VALUES: Record<SortKey, (row: GoogleAdsRow) => string | number | null> = {
  name: row => row.name,
  cost: row => row.cost,
  clicks: row => row.clicks,
  impressions: row => row.impressions,
  ctr: row => getCtr(row),
  conversions: row => row.conversions,
  costPerConversion: row => (row.conversions ? row.cost / row.conversions : null),
  conversionsValue: row => row.conversionsValue,
};

function sortRows(rows: GoogleAdsRow[], key: SortKey, direction: SortDirection, locale: string) {
  const getValue = SORT_VALUES[key];
  const sign = direction === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const x = getValue(a);
    const y = getValue(b);

    if (x === null || y === null) {
      return x === y ? 0 : x === null ? 1 : -1;
    }
    if (typeof x === 'string' || typeof y === 'string') {
      return sign * String(x).localeCompare(String(y), locale);
    }

    return sign * (x - y);
  });
}

export function GoogleAdsTable({
  websiteId,
  startDate,
  endDate,
  dimension,
  filter,
  onClearFilter,
  onDrill,
}: GoogleAdsTableProps) {
  const t = useTranslations('ads');
  const { t: tm, labels } = useMessages();
  const { locale } = useLocale();
  const { isPhone, isMobile } = useMobile();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'cost',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);

  // A filter only reaches the levels below it: a campaign narrows ad groups and keywords, an
  // ad group narrows keywords.
  const campaignId =
    BELOW_CAMPAIGN.has(dimension) && filter?.type === 'campaign' ? filter.id : undefined;
  const adGroupId =
    BELOW_AD_GROUP.has(dimension) && filter?.type === 'adGroup' ? filter.id : undefined;
  const activeFilter = campaignId || adGroupId ? filter : null;

  const { data, isLoading, error } = useGoogleAdsQuery({
    websiteId,
    startDate,
    endDate,
    dimension,
    limit: ROW_LIMIT,
    campaignId,
    adGroupId,
  });
  const currency = data?.currencyCode ?? null;

  const rows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(locale);
    // Devices and networks arrive as enum values; name them before searching and sorting.
    const valueLabels: Record<string, string> | undefined =
      VALUE_LABELS[dimension as keyof typeof VALUE_LABELS];
    const named = valueLabels
      ? (data?.rows ?? []).map(row => ({
          ...row,
          name: valueLabels[row.name]
            ? t(valueLabels[row.name] as 'deviceMobile')
            : formatEnum(row.name),
        }))
      : (data?.rows ?? []);
    const matches = named.filter(
      row =>
        !term ||
        row.name.toLocaleLowerCase(locale).includes(term) ||
        row.parent?.toLocaleLowerCase(locale).includes(term),
    );

    return sortRows(matches, sort.key, sort.direction, locale);
  }, [data, dimension, search, sort, locale, t]);

  // Searching or narrowing can leave fewer pages than the one being viewed.
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / PAGE_SIZE)));
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const sortable = (key: SortKey, label: string) => (
    <SortableLabel
      label={label}
      sortKey={key}
      // Names read best A to Z; for numbers the largest are the ones worth seeing first.
      defaultDirection={key === 'name' ? 'asc' : 'desc'}
      direction={sort.key === key ? sort.direction : null}
      onSort={direction => {
        setSort({ key, direction });
        setPage(1);
      }}
    />
  );

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="300px">
      <Column gap>
        {(data?.rows?.length > 0 || activeFilter) && (
          <Row alignItems="center" gap="3" wrap="wrap">
            <SearchField
              value={search}
              onSearch={value => {
                setSearch(value);
                setPage(1);
              }}
              placeholder={tm(labels.search)}
              className="w-full max-w-md"
            />
            {activeFilter && (
              <Button variant="outline" onClick={onClearFilter} title={t('clearFilter')}>
                <Text>{activeFilter.name}</Text>
                <Icon size="sm">
                  <X />
                </Icon>
              </Button>
            )}
          </Row>
        )}
        {rows.length === 0 && <Empty />}
        {rows.length > 0 && (
          // The page clips rather than scrolls sideways, so a phone gets cards and a narrow
          // window drops the two columns the others already imply. They are left out rather
          // than marked hidden: a hidden column still takes its width in the grid.
          <DataTable data={pageRows} displayMode={isPhone ? 'cards' : 'table'}>
            {/* The header and each row are separate grids, so every column needs a size that does
                not depend on its contents, or the columns drift out of line. */}
            <DataColumn
              id="name"
              label={sortable('name', t(DIMENSION_LABELS[dimension]))}
              width="minmax(160px, 1fr)"
            >
              {(row: GoogleAdsRow) => <RowName row={row} dimension={dimension} onDrill={onDrill} />}
            </DataColumn>
            <DataColumn id="cost" label={sortable('cost', t('cost'))} align="end" width="90px">
              {(row: GoogleAdsRow) => formatMoney(row.cost, currency, locale)}
            </DataColumn>
            <DataColumn
              id="clicks"
              label={sortable('clicks', t('clicks'))}
              align="end"
              width="80px"
            >
              {(row: GoogleAdsRow) => formatLongNumber(row.clicks)}
            </DataColumn>
            {!isMobile && (
              <DataColumn
                id="impressions"
                label={sortable('impressions', t('impressions'))}
                align="end"
                width="110px"
              >
                {(row: GoogleAdsRow) => formatLongNumber(row.impressions)}
              </DataColumn>
            )}
            <DataColumn id="ctr" label={sortable('ctr', t('ctr'))} align="end" width="70px">
              {(row: GoogleAdsRow) => formatPercent(getCtr(row))}
            </DataColumn>
            <DataColumn
              id="conversions"
              label={sortable('conversions', t('conversions'))}
              align="end"
              width="110px"
            >
              {(row: GoogleAdsRow) => formatConversions(row.conversions)}
            </DataColumn>
            <DataColumn
              id="costPerConversion"
              label={sortable('costPerConversion', t('costPerConversion'))}
              align="end"
              width="110px"
            >
              {(row: GoogleAdsRow) =>
                row.conversions
                  ? formatMoney(row.cost / row.conversions, currency, locale)
                  : NO_VALUE
              }
            </DataColumn>
            {!isMobile && (
              <DataColumn
                id="conversionsValue"
                label={sortable('conversionsValue', t('conversionValue'))}
                align="end"
                width="140px"
              >
                {(row: GoogleAdsRow) => formatMoney(row.conversionsValue, currency, locale)}
              </DataColumn>
            )}
          </DataTable>
        )}
        <Pager page={currentPage} pageSize={PAGE_SIZE} count={rows.length} onPageChange={setPage} />
      </Column>
    </LoadingPanel>
  );
}

function RowName({
  row,
  dimension,
  onDrill,
}: {
  row: GoogleAdsRow;
  dimension: GoogleAdsTableProps['dimension'];
  onDrill?: (row: GoogleAdsRow) => void;
}) {
  const t = useTranslations('ads');
  // Cards size to their content, so a name that cannot wrap would push them past the panel.
  const { isPhone } = useMobile();
  const matchLabel = MATCH_TYPE_LABELS[row.matchType as keyof typeof MATCH_TYPE_LABELS];
  const statusLabel = STATUS_LABELS[row.status as keyof typeof STATUS_LABELS];
  // An enabled status is the norm and says nothing; anything else explains missing traffic.
  const status =
    row.status && row.status !== 'ENABLED'
      ? statusLabel
        ? t(statusLabel)
        : formatEnum(row.status)
      : null;
  const details = [
    row.parent,
    row.type && formatEnum(row.type),
    matchLabel && t(matchLabel),
    status,
  ]
    .filter(Boolean)
    .join(' · ');
  const drillLabel = DRILL_LABELS[dimension];
  const name = (
    <Text truncate={!isPhone} title={row.name}>
      {row.name}
    </Text>
  );

  return (
    <Column overflow="hidden" minWidth="0" width="100%">
      {onDrill && drillLabel ? (
        <button
          type="button"
          onClick={() => onDrill(row)}
          title={t(drillLabel)}
          className="inline-flex min-w-0 max-w-full appearance-none border-0 bg-transparent p-0 text-left text-inherit hover:underline"
        >
          {name}
        </button>
      ) : (
        name
      )}
      {details && (
        <Text truncate={!isPhone} size="sm" color="muted-foreground" title={details}>
          {details}
        </Text>
      )}
    </Column>
  );
}
