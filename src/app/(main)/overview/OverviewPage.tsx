'use client';
import {
  Column,
  DataColumn,
  DataTable,
  Icon,
  ListItem,
  Row,
  Select,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from '@umami/react-zen';
import { colord } from 'colord';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { MultiSelect, MultiSelectItem } from '@/components/common/MultiSelect';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import {
  useApi,
  useDateParameters,
  useDateRange,
  useLocale,
  useLoginQuery,
  useMessages,
  useNavigation,
  useUserWebsitesQuery,
} from '@/components/hooks';
import { ChartArea, ChartColumnStacked, ChartLine } from '@/components/icons';
import { DateFilter } from '@/components/input/DateFilter';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries, getDateRangeValue } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';
import { getItem, setItem } from '@/lib/storage';

const MAX_WEBSITES = 20;
// Which table columns the user keeps visible; per browser, like other view
// preferences (e.g. the date range default).
const COLUMNS_KEY = 'umami.overview.columns';

type ChartType = 'bar' | 'line' | 'area';

// Stacked bars answer "how much in total, and who contributed"; lines answer
// "who is trending up"; area is the stacked reading with a smoother shape.
const CHART_TYPES: { id: ChartType; icon: ReactNode }[] = [
  { id: 'bar', icon: <ChartColumnStacked /> },
  { id: 'line', icon: <ChartLine /> },
  { id: 'area', icon: <ChartArea /> },
];

type Point = { x: string; y: number };
type EventPoint = { x: string; t: string; y: number };

interface OverviewWebsite {
  id: string;
  name: string;
  domain: string;
  pageviews: Point[];
  sessions: Point[];
  events: EventPoint[];
}

function sum(points: { y: number }[]) {
  return points.reduce((total, point) => total + Number(point.y), 0);
}

// One series per website for the chosen metric. Built-in metrics come from the
// pageview/session series; anything else is a custom event name.
function seriesFor(website: OverviewWebsite, metric: string): Point[] {
  if (metric === 'pageviews') return website.pageviews;
  if (metric === 'visitors') return website.sessions;

  return website.events.filter(event => event.x === metric).map(({ t, y }) => ({ x: t, y }));
}

export function OverviewPage() {
  const { t, labels } = useMessages();
  const { user } = useLoginQuery();
  const { teamId, router, updateParams } = useNavigation();
  const { locale, dateLocale } = useLocale();
  const { dateRange } = useDateRange();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const { get, useQuery } = useApi();

  const websitesQuery = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { pageSize: MAX_WEBSITES },
  );
  const websites: { id: string; name: string; domain: string }[] = websitesQuery.data?.data ?? [];

  const [selected, setSelected] = useState<string[]>([]);
  const [metric, setMetric] = useState('pageviews');
  const [chartType, setChartType] = useState<ChartType>('bar');
  // null = every column (the default until the user customises the table).
  const [columns, setColumns] = useState<string[] | null>(null);

  useEffect(() => {
    const saved = getItem(COLUMNS_KEY);
    if (Array.isArray(saved)) setColumns(saved);
  }, []);

  // Default to every website the user can see, once the list has loaded.
  useEffect(() => {
    if (selected.length === 0 && websites.length > 0) {
      setSelected(websites.slice(0, MAX_WEBSITES).map(website => website.id));
    }
  }, [websites]);

  const { data, isLoading, error } = useQuery<{
    data: OverviewWebsite[];
    startDate?: string | null;
    endDate?: string | null;
  }>({
    queryKey: ['websites:overview', { ids: selected, startAt, endAt, unit, timezone }],
    queryFn: () =>
      get('/websites/overview', { ids: selected.join(','), startAt, endAt, unit, timezone }),
    enabled: selected.length > 0,
  });

  const rows = data?.data ?? [];

  // Event names seen across the selected websites, most frequent first.
  const eventNames = useMemo(() => {
    const totals = new Map<string, number>();
    for (const website of rows) {
      for (const event of website.events) {
        totals.set(event.x, (totals.get(event.x) ?? 0) + Number(event.y));
      }
    }
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [rows]);

  const metricLabel = (value: string) =>
    value === 'pageviews' ? t(labels.views) : value === 'visitors' ? t(labels.visitors) : value;

  const chartData: any = useMemo(() => {
    return {
      __id: Date.now(),
      datasets: rows.map((website, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const series = generateTimeSeries(
          seriesFor(website, metric),
          dateRange.startDate,
          dateRange.endDate,
          unit,
          dateLocale,
        );

        if (chartType === 'bar') {
          return {
            label: website.name,
            data: series,
            type: 'bar',
            borderColor: color,
            backgroundColor: color,
            borderWidth: 1,
            barPercentage: 0.9,
            categoryPercentage: 0.9,
          };
        }

        // generateTimeSeries leaves buckets with no rows as null. A bar renders
        // the same for null and 0, but a line breaks at null (Chart.js spanGaps
        // is off by default) and a stacked area cannot stack across the hole.
        // These are counts, so an empty bucket genuinely is zero — fill it,
        // rather than spanning the gap and inventing a slope across idle time.
        return {
          label: website.name,
          data: series.map(point => ({ ...point, y: point.y ?? 0 })),
          type: 'line',
          borderColor: color,
          backgroundColor: chartType === 'area' ? colord(color).alpha(0.25).toRgbString() : color,
          fill: chartType === 'area',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 2,
        };
      }),
    };
  }, [rows, metric, chartType, dateRange, unit, dateLocale]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  const tableRows = useMemo(() => {
    return rows.map(website => {
      const row: Record<string, any> = {
        id: website.id,
        name: website.name,
        domain: website.domain,
        pageviews: sum(website.pageviews),
        visitors: sum(website.sessions),
      };
      for (const name of eventNames) {
        row[`event:${name}`] = sum(website.events.filter(event => event.x === name));
      }
      return row;
    });
  }, [rows, eventNames]);

  // "All time" spans the earliest to the latest data across the selected
  // websites, mirroring WebsiteDateFilter's handling for a single website.
  const hasData = Boolean(data?.startDate && data?.endDate);

  const handleDateChange = (date: string) => {
    if (date === 'all' && hasData) {
      router.push(
        updateParams({
          date: `${getDateRangeValue(new Date(data.startDate), new Date(data.endDate))}:all`,
          offset: undefined,
          unit: undefined,
        }),
      );
      return;
    }
    router.push(updateParams({ date, offset: undefined, unit: undefined }));
  };

  // Built-in metrics first, then every event name seen in the data. The picker
  // in the page header toggles these; name and domain are always shown.
  const allColumns = useMemo(
    () => [
      { id: 'pageviews', label: t(labels.views) },
      { id: 'visitors', label: t(labels.visitors) },
      ...eventNames.map(name => ({ id: `event:${name}`, label: name })),
    ],
    [eventNames, t, labels],
  );
  const visibleColumns = columns
    ? allColumns.filter(column => columns.includes(column.id))
    : allColumns;

  const handleColumnsChange = (values: string[]) => {
    setColumns(values);
    setItem(COLUMNS_KEY, values);
  };

  const numberCell = (key: string) => (row: any) => (
    <Text style={{ fontVariantNumeric: 'tabular-nums' }}>{formatLongNumber(row[key] ?? 0)}</Text>
  );

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={t(labels.overview)}>
          <MultiSelect
            value={visibleColumns.map(column => column.id)}
            onChange={handleColumnsChange}
            placeholder={t(labels.fields)}
            renderValue={values => `${t(labels.fields)} (${values.length}/${allColumns.length})`}
          >
            {allColumns.map(column => (
              <MultiSelectItem key={column.id} value={column.id}>
                {column.label}
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </PageHeader>
        <Row gap="3" wrap="wrap" alignItems="flex-end">
          <Column gap="1" style={{ minWidth: 260 }}>
            <Text size="sm" color="muted">
              {t(labels.websites)}
            </Text>
            <MultiSelect
              value={selected}
              onChange={values => setSelected(values.slice(0, MAX_WEBSITES))}
              placeholder={t(labels.selectWebsite)}
              renderValue={values =>
                values.length === websites.length
                  ? `${t(labels.all)} (${values.length})`
                  : values
                      .map(id => websites.find(website => website.id === id)?.name ?? id)
                      .join(', ')
              }
            >
              {websites.map(website => (
                <MultiSelectItem key={website.id} value={website.id}>
                  {website.name}
                </MultiSelectItem>
              ))}
            </MultiSelect>
          </Column>
          <Column gap="1" style={{ minWidth: 200 }}>
            <Text size="sm" color="muted">
              {t(labels.metrics)}
            </Text>
            <Select value={metric} onChange={value => setMetric(String(value))}>
              <ListItem id="pageviews">{t(labels.views)}</ListItem>
              <ListItem id="visitors">{t(labels.visitors)}</ListItem>
              {eventNames.map(name => (
                <ListItem key={name} id={name}>
                  {name}
                </ListItem>
              ))}
            </Select>
          </Column>
          <Column gap="1">
            <Text size="sm" color="muted">
              {t(labels.chart)}
            </Text>
            <ToggleGroup
              value={[chartType]}
              onChange={keys => {
                const next = keys[0] as ChartType;
                if (next) setChartType(next);
              }}
            >
              {CHART_TYPES.map(({ id, icon }) => (
                <ToggleGroupItem key={id} id={id} aria-label={id}>
                  <Icon>{icon}</Icon>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Column>
          <DateFilter value={dateRange.value} onChange={handleDateChange} showAllTime={hasData} />
          {dateRange.value?.endsWith(':all') && (
            <Text size="sm" color="muted">
              {t(labels.allTime)}
            </Text>
          )}
        </Row>
        <Panel>
          <LoadingPanel data={data} isLoading={isLoading} error={error} isEmpty={rows.length === 0}>
            <Column gap="3">
              <Text weight="bold">{metricLabel(metric)}</Text>
              <BarChart
                chartData={chartData}
                unit={unit}
                minDate={dateRange.startDate}
                maxDate={dateRange.endDate}
                renderXLabel={renderXLabel}
                stacked={chartType !== 'line'}
                height="400px"
              />
            </Column>
          </LoadingPanel>
        </Panel>
        <Panel>
          <DataTable data={tableRows}>
            <DataColumn id="name" label={t(labels.name)}>
              {(row: any) => <Text weight="bold">{row.name}</Text>}
            </DataColumn>
            <DataColumn id="domain" label={t(labels.domain)}>
              {(row: any) => <Text color="muted">{row.domain}</Text>}
            </DataColumn>
            {visibleColumns.map(column => (
              <DataColumn key={column.id} id={column.id} label={column.label} align="end">
                {numberCell(column.id)}
              </DataColumn>
            ))}
          </DataTable>
        </Panel>
      </Column>
    </PageBody>
  );
}
