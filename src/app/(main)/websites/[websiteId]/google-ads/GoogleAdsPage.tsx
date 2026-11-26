'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Column,
  Heading,
  Loading,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@umami/react-zen';
import { differenceInCalendarDays, format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type GoogleAdsQueryError,
  type GoogleAdsRow,
  useDateRange,
  useGoogleAdsQuery,
  useLocale,
  useMessages,
  useNavigation,
  useSubscription,
  useTimezone,
  useWebsite,
} from '@/components/hooks';
import { Megaphone } from '@/components/icons';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { AdsConnectionSelect } from './AdsConnectionSelect';
import {
  formatMetric,
  GOOGLE_ADS_METRICS,
  type GoogleAdsMetric,
  isLowerBetter,
  NO_VALUE,
  sumRows,
} from './format';
import { GoogleAdsChart } from './GoogleAdsChart';
import { GoogleAdsConversionsTable } from './GoogleAdsConversionsTable';
import { GoogleAdsTable, type GoogleAdsTableFilter } from './GoogleAdsTable';

const INTEGRATIONS_URL = `${process.env.cloudUrl || ''}/settings/integrations`;

// Cloud rejects longer ranges. Narrowing the range here instead would show a lower total
// spend under a date filter that still says "All time".
const MAX_RANGE_DAYS = 731;

const PERFORMANCE_METRICS: GoogleAdsMetric[] = ['cost', 'clicks', 'impressions', 'ctr', 'cpc'];
const CONVERSION_METRICS: GoogleAdsMetric[] = [
  'conversions',
  'conversionsValue',
  'costPerConversion',
  'conversionRate',
  'roas',
];

export function GoogleAdsPage({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const {
    query: { connection },
  } = useNavigation();
  const { hasFeature, cloudMode, isLoading } = useSubscription(website?.teamId);
  const isAllowed = !cloudMode || hasFeature('googleAds');

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!isAllowed) {
    return <UpgradePlaceholder />;
  }

  // Campaign filters, tabs and table state belong to one ad account; switching starts afresh.
  return <GoogleAdsReport key={connection ?? ''} websiteId={websiteId} />;
}

function UpgradePlaceholder() {
  const t = useTranslations('ads');
  const { t: tm, labels, messages } = useMessages();

  return (
    <Panel>
      <EmptyPlaceholder
        icon={<Megaphone />}
        title={tm(messages.upgradeRequired, { plan: 'Pro' })}
        description={t('description')}
      >
        <Button onClick={() => window.open(`${process.env.cloudUrl}/settings/billing`, '_blank')}>
          {tm(labels.upgrade)}
        </Button>
      </EmptyPlaceholder>
    </Panel>
  );
}

function GoogleAdsReport({ websiteId }: { websiteId: string }) {
  const t = useTranslations('ads');
  const queryClient = useQueryClient();
  const {
    router,
    query: { connection },
    updateParams,
  } = useNavigation();
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate: rangeStart, endDate: rangeEnd, unit },
    dateCompare,
    hasComparison,
    isAllTime,
  } = useDateRange({ timezone });
  const [performanceMetric, setPerformanceMetric] = useState<GoogleAdsMetric>('cost');
  const [conversionMetric, setConversionMetric] = useState<GoogleAdsMetric>('conversions');
  const [tab, setTab] = useState('campaign');
  // Set by opening a campaign or ad group; it narrows the tabs below that level.
  const [filter, setFilter] = useState<GoogleAdsTableFilter | null>(null);

  // Google reports whole days, so the page works in calendar days. useDateRange returns new
  // Date objects on every render (and relative ranges move with the clock), so keying the
  // dates on the day keeps the chart from redrawing on unrelated re-renders, such as the
  // subscription refetch that runs when the window regains focus.
  const startDay = format(rangeStart, 'yyyy-MM-dd');
  const endDay = format(rangeEnd, 'yyyy-MM-dd');
  const startDate = useMemo(() => new Date(`${startDay}T00:00:00`), [startDay]);
  const endDate = useMemo(() => new Date(`${endDay}T23:59:59.999`), [endDay]);
  const isRangeTooLong = differenceInCalendarDays(endDate, startDate) > MAX_RANGE_DAYS;

  // One row per day drives both the totals and the charts.
  const daily = useGoogleAdsQuery(
    {
      websiteId,
      startDate,
      endDate,
      dimension: 'date',
      limit: 1000,
    },
    { enabled: !isRangeTooLong },
  );

  // The comparison period only feeds the change shown on each card. If it fails, the cards
  // simply show no change.
  const canCompare = !isRangeTooLong && !isAllTime && hasComparison;
  const previous = useGoogleAdsQuery(
    {
      websiteId,
      startDate: dateCompare.startDate,
      endDate: dateCompare.endDate,
      dimension: 'date',
      limit: 1000,
    },
    { enabled: canCompare },
  );
  const previousRows = canCompare ? previous.data?.rows : undefined;
  const currency = daily.data?.currencyCode ?? null;

  // The chosen account was disconnected since the account list was read: report on the
  // default instead, and re-read the list so the dropdown drops it too.
  const isChosenGone = !!connection && daily.error?.code === 'not_connected';
  useEffect(() => {
    if (isChosenGone) {
      queryClient.invalidateQueries({ queryKey: ['ads-connections', { websiteId }] });
      router.replace(updateParams({ connection: undefined }));
    }
  }, [isChosenGone]);

  const setupProblem = getSetupProblem(daily.error);
  let placeholder = null;

  if (isChosenGone) {
    placeholder = <Loading placement="absolute" />;
  } else if (isRangeTooLong) {
    placeholder = (
      <Panel>
        <EmptyPlaceholder
          icon={<Megaphone />}
          title={t('rangeTooLong')}
          description={t('rangeTooLongDescription')}
        />
      </Panel>
    );
  } else if (daily.error?.code === 'subscription_required') {
    // Cloud enforces the plan too; it wins if the dashboard's view of the plan is stale.
    placeholder = <UpgradePlaceholder />;
  } else if (setupProblem) {
    placeholder = <GoogleAdsPlaceholder problem={setupProblem} />;
  }

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowFilter={false} />
      <AdsConnectionSelect websiteId={websiteId} />
      {placeholder || (
        <>
          <LoadingPanel
            data={daily.data}
            isLoading={daily.isLoading}
            error={daily.error}
            minHeight="120px"
          >
            {daily.data && (
              <GoogleAdsMetricCards
                metrics={PERFORMANCE_METRICS}
                rows={daily.data.rows}
                previousRows={previousRows}
                currency={currency}
                selected={performanceMetric}
                onSelect={setPerformanceMetric}
              />
            )}
          </LoadingPanel>
          <Panel>
            <LoadingPanel
              data={daily.data}
              isLoading={daily.isLoading}
              error={daily.error}
              minHeight="400px"
            >
              {daily.data && (
                <GoogleAdsChart
                  rows={daily.data.rows}
                  metric={performanceMetric}
                  currency={currency}
                  minDate={startDate}
                  maxDate={endDate}
                  unit={unit}
                />
              )}
            </LoadingPanel>
          </Panel>
          <Heading size="2xl">{t('conversions')}</Heading>
          <LoadingPanel
            data={daily.data}
            isLoading={daily.isLoading}
            error={daily.error}
            minHeight="120px"
          >
            {daily.data && (
              <GoogleAdsMetricCards
                metrics={CONVERSION_METRICS}
                rows={daily.data.rows}
                previousRows={previousRows}
                currency={currency}
                selected={conversionMetric}
                onSelect={setConversionMetric}
              />
            )}
          </LoadingPanel>
          <Panel>
            <LoadingPanel
              data={daily.data}
              isLoading={daily.isLoading}
              error={daily.error}
              minHeight="400px"
            >
              {daily.data && (
                <GoogleAdsChart
                  rows={daily.data.rows}
                  metric={conversionMetric}
                  currency={currency}
                  minDate={startDate}
                  maxDate={endDate}
                  unit={unit}
                />
              )}
            </LoadingPanel>
          </Panel>
          <GoogleAdsConversionsTable
            websiteId={websiteId}
            startDate={startDate}
            endDate={endDate}
          />
          <Heading size="2xl">{t('ads')}</Heading>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="campaign">{t('campaigns')}</TabsTrigger>
              <TabsTrigger value="ad_group">{t('adGroups')}</TabsTrigger>
              <TabsTrigger value="keyword">{t('keywords')}</TabsTrigger>
              <TabsTrigger value="search_term">{t('searchTerms')}</TabsTrigger>
              <TabsTrigger value="landing_page">{t('landingPages')}</TabsTrigger>
              <TabsTrigger value="device">{t('devices')}</TabsTrigger>
              <TabsTrigger value="network">{t('networks')}</TabsTrigger>
            </TabsList>
            <TabsContent value="campaign">
              <GoogleAdsTable
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dimension="campaign"
                onDrill={row => {
                  setFilter({ type: 'campaign', id: row.key, name: row.name });
                  setTab('ad_group');
                }}
              />
            </TabsContent>
            <TabsContent value="ad_group">
              <GoogleAdsTable
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dimension="ad_group"
                filter={filter}
                onClearFilter={() => setFilter(null)}
                onDrill={row => {
                  setFilter({ type: 'adGroup', id: row.key, name: row.name });
                  setTab('keyword');
                }}
              />
            </TabsContent>
            <TabsContent value="keyword">
              <GoogleAdsTable
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dimension="keyword"
                filter={filter}
                onClearFilter={() => setFilter(null)}
              />
            </TabsContent>
            <TabsContent value="search_term">
              <GoogleAdsTable
                websiteId={websiteId}
                startDate={startDate}
                endDate={endDate}
                dimension="search_term"
                filter={filter}
                onClearFilter={() => setFilter(null)}
              />
            </TabsContent>
            {(['landing_page', 'device', 'network'] as const).map(dimension => (
              <TabsContent key={dimension} value={dimension}>
                <GoogleAdsTable
                  websiteId={websiteId}
                  startDate={startDate}
                  endDate={endDate}
                  dimension={dimension}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </Column>
  );
}

const TOOLTIPS: Partial<Record<GoogleAdsMetric, 'conversionsTooltip' | 'roasTooltip'>> = {
  conversions: 'conversionsTooltip',
  roas: 'roasTooltip',
};

/** Totals for the range, each a button that puts its metric on the chart below. */
function GoogleAdsMetricCards({
  metrics,
  rows,
  previousRows,
  currency,
  selected,
  onSelect,
}: {
  metrics: GoogleAdsMetric[];
  rows: GoogleAdsRow[];
  /** The comparison period's rows, when there is one to compare with. */
  previousRows?: GoogleAdsRow[];
  currency: string | null;
  selected: GoogleAdsMetric;
  onSelect: (metric: GoogleAdsMetric) => void;
}) {
  const t = useTranslations('ads');
  const { locale } = useLocale();
  const totals = sumRows(rows);
  const previousTotals = previousRows ? sumRows(previousRows) : null;

  return (
    <MetricsBar>
      {metrics.map(metric => {
        const { label, get } = GOOGLE_ADS_METRICS[metric];
        const value = get(totals);
        const previous = previousTotals ? get(previousTotals) : null;
        // A change needs a value on both sides; a missing ratio is not a zero.
        const hasChange = value !== null && previous !== null;
        const tooltip = TOOLTIPS[metric];

        return (
          <MetricCard
            key={metric}
            label={t(label)}
            tooltip={tooltip && t(tooltip)}
            value={value ?? 0}
            formatValue={
              value === null
                ? () => NO_VALUE
                : (n: number) => formatMetric(metric, n, currency, locale)
            }
            change={hasChange ? value - previous : 0}
            showChange={hasChange}
            reverseColors={isLowerBetter(metric)}
            onClick={() => onSelect(metric)}
            selected={metric === selected}
          />
        );
      })}
    </MetricsBar>
  );
}

type SetupProblem = 'notConnected' | 'accountNotSet' | 'reconnect' | 'accountAccess';

/**
 * Setup problems the customer fixes in Cloud settings, not by retrying. Anything else falls
 * through to the regular error display.
 */
function getSetupProblem(error?: GoogleAdsQueryError | null): SetupProblem | null {
  switch (error?.code) {
    case 'not_connected':
      return 'notConnected';
    case 'account_not_set':
    case 'manager_account':
      return 'accountNotSet';
    case 'authentication':
      return 'reconnect';
    case 'permission':
      return 'accountAccess';
    default:
      return null;
  }
}

function GoogleAdsPlaceholder({ problem }: { problem: SetupProblem }) {
  const t = useTranslations('ads');

  return (
    <Panel>
      <EmptyPlaceholder
        icon={<Megaphone />}
        title={t(problem)}
        description={t(`${problem}Description`)}
      >
        <Button onClick={() => window.open(INTEGRATIONS_URL, '_blank')}>
          {t('manageIntegrations')}
        </Button>
      </EmptyPlaceholder>
    </Panel>
  );
}
