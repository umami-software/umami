'use client';
import { Column, Grid, ListItem, Loading, Select, useDebounce } from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { ComboBox } from '@/components/common/ComboBox';
import { Empty } from '@/components/common/Empty';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks/useApi';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useLocale } from '@/components/hooks/useLocale';
import { useMessages } from '@/components/hooks/useMessages';
import { useNavigation } from '@/components/hooks/useNavigation';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';

export function useErrorFilters() {
  const { startAt, endAt } = useDateParameters();
  const { query } = useNavigation();
  return {
    startAt,
    endAt,
    page: Math.max(1, Math.min(10000, Number(query.page) || 1)),
    pageSize: 25,
    ...Object.fromEntries(
      ['status', 'search', 'release', 'environment', 'browser', 'urlPath']
        .filter(key => query[key])
        .map(key => [key, query[key]]),
    ),
  };
}

export function useErrorQuery(
  websiteId: string,
  path: string,
  params: object = {},
  enabled = true,
) {
  const { get, useQuery } = useApi();
  return useQuery({
    queryKey: ['errors', websiteId, path, params],
    queryFn: () => get(`/websites/${websiteId}/errors${path}`, params),
    enabled,
  });
}

const VALUE_FIELDS = ['release', 'environment', 'browser', 'urlPath'] as const;

export function ErrorFilters({ websiteId, issueId }: { websiteId: string; issueId?: string }) {
  const t = useTranslations('errorTracking');
  const { query, router, updateParams } = useNavigation();

  const applyFilter = (key: string, value?: string | number | null) => {
    router.replace(updateParams({ [key]: value || undefined, page: 1, occurrence: undefined }), {
      scroll: false,
    });
  };

  return (
    <Grid
      columns={{
        base: '1fr',
        md: 'repeat(3, minmax(0, 1fr))',
        xl: `repeat(${issueId ? 4 : 5}, minmax(0, 1fr))`,
      }}
      gap
      alignItems="end"
    >
      {!issueId && (
        <Select
          label={t('status')}
          value={query.status || ''}
          onChange={value => applyFilter('status', value)}
        >
          <ListItem id="">{t('allStatuses')}</ListItem>
          {['unresolved', 'resolved', 'ignored'].map(status => (
            <ListItem key={status} id={status}>
              {t(status)}
            </ListItem>
          ))}
        </Select>
      )}
      {VALUE_FIELDS.map(key => (
        <ErrorValueFilter
          key={`${key}:${query[key] || ''}`}
          websiteId={websiteId}
          issueId={issueId}
          type={key}
          value={query[key] || null}
          onChange={value => applyFilter(key, value)}
        />
      ))}
    </Grid>
  );
}

function ErrorValueFilter({
  websiteId,
  issueId,
  type,
  value,
  onChange,
}: {
  websiteId: string;
  issueId?: string;
  type: (typeof VALUE_FIELDS)[number];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const t = useTranslations('errorTracking');
  const { t: tm, messages } = useMessages();
  const { page: _page, pageSize: _pageSize, ...filters } = useErrorFilters();
  const [search, setSearch] = useState('');
  const searchValue = useDebounce(search, 300);
  const { data, isLoading } = useErrorQuery(websiteId, `${issueId ? `/${issueId}` : ''}/values`, {
    ...filters,
    type,
    value: searchValue || undefined,
  });
  const items = useMemo(
    () => [...new Set([value, ...(data || []).map(row => row.value)].filter(Boolean))],
    [value, data],
  );

  return (
    <ComboBox
      label={t(type)}
      placeholder={t('all')}
      value={value}
      onChange={onChange}
      onInputValueChange={(input, details) => {
        if (details.reason === 'input-change') setSearch(input);
      }}
      filter={null}
      showClear={!!value}
      renderEmptyState={() =>
        isLoading ? (
          <Loading placement="center" icon="dots" />
        ) : (
          <Empty message={tm(messages.noResultsFound)} />
        )
      }
    >
      {items.map(item => (
        <ListItem key={item} id={item}>
          {item}
        </ListItem>
      ))}
    </ComboBox>
  );
}

export function ErrorStats({
  data,
  startAt,
  endAt,
}: {
  data: {
    occurrences: number;
    visits: number;
    issues: number;
    series?: Array<{ date: string; occurrences: number }>;
  };
  startAt: number;
  endAt: number;
}) {
  const t = useTranslations('errorTracking');
  const { locale } = useLocale();
  const chartData = useMemo(() => {
    const counts = new Map((data.series || []).map(row => [row.date, row.occurrences]));
    const start = Math.floor(startAt / 86400000) * 86400000;
    const days = Math.max(1, Math.floor(endAt / 86400000) - Math.floor(startAt / 86400000) + 1);
    return {
      datasets: [
        {
          label: t('occurrences'),
          backgroundColor: CHART_COLORS[0],
          borderColor: CHART_COLORS[0],
          data: Array.from({ length: days }, (_, index) => {
            const date = new Date(start + index * 86400000).toISOString().slice(0, 10);
            // The API groups by UTC calendar day; preserve that day in the chart's local date labels.
            return { x: `${date}T00:00:00`, y: counts.get(date) || 0 };
          }),
        },
      ],
    };
  }, [data.series, startAt, endAt, t]);
  const renderXLabel = useMemo(() => renderDateLabels('day', locale), [locale]);

  return (
    <Column gap>
      <MetricsBar>
        {(['occurrences', 'visits', 'issues'] as const).map(key => (
          <MetricCard key={key} label={t(key)} value={data[key]} />
        ))}
      </MetricsBar>
      <Panel>
        <BarChart
          chartData={chartData}
          minDate={new Date(`${new Date(startAt).toISOString().slice(0, 10)}T00:00:00`)}
          maxDate={new Date(`${new Date(endAt).toISOString().slice(0, 10)}T00:00:00`)}
          unit="day"
          renderXLabel={renderXLabel}
          height="300px"
        />
      </Panel>
    </Column>
  );
}
