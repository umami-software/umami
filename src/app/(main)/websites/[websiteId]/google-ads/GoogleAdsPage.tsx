'use client';
import { Button, Column, Heading, Loading, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { differenceInCalendarDays, format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
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
  useSubscription,
  useTimezone,
  useWebsite,
} from '@/components/hooks';
import { Megaphone } from '@/components/icons';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
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
import { GoogleAdsTable } from './GoogleAdsTable';

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
  const { hasFeature, cloudMode, isLoading } = useSubscription(website?.teamId);
  const isAllowed = !cloudMode || hasFeature('googleAds');

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!isAllowed) {
    return <UpgradePlaceholder />;
  }

  return <GoogleAdsReport websiteId={websiteId} />;
}

function UpgradePlaceholder() {
  const t = useTranslations('googleAds');
  const { t: tm, labels, messages } = useMessages();

  return (
    <Panel>
      <EmptyPlaceholder
        icon={<Megaphone />}
        title={tm(messages.upgradeRequired, { plan: 'Pro' })}
        description={t('description')}
      >
        <Button
          variant="primary"
          onPress={() => window.open(`${process.env.cloudUrl}/settings/billing`, '_blank')}
        >
          {tm(labels.upgrade)}
        </Button>
      </EmptyPlaceholder>
    </Panel>
  );
}

function GoogleAdsReport({ websiteId }: { websiteId: string }) {
  const t = useTranslations('googleAds');
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate: rangeStart, endDate: rangeEnd, unit },
    dateCompare,
    hasComparison,
    isAllTime,
  } = useDateRange({ timezone });
  const [performanceMetric, setPerformanceMetric] = useState<GoogleAdsMetric>('cost');
  const [conversionMetric, setConversionMetric] = useState<GoogleAdsMetric>('conversions');

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

  const setupProblem = getSetupProblem(daily.error);
  let placeholder = null;

  if (isRangeTooLong) {
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
          <Panel>
            <GoogleAdsConversionsTable
              websiteId={websiteId}
              startDate={startDate}
              endDate={endDate}
            />
          </Panel>
          <Heading size="2xl">{t('ads')}</Heading>
          <Panel>
            <Tabs>
              <TabList>
                <Tab id="campaign">{t('campaigns')}</Tab>
                <Tab id="ad_group">{t('adGroups')}</Tab>
                <Tab id="keyword">{t('keywords')}</Tab>
              </TabList>
              <TabPanel id="campaign">
                <GoogleAdsTable
                  websiteId={websiteId}
                  startDate={startDate}
                  endDate={endDate}
                  dimension="campaign"
                />
              </TabPanel>
              <TabPanel id="ad_group">
                <GoogleAdsTable
                  websiteId={websiteId}
                  startDate={startDate}
                  endDate={endDate}
                  dimension="ad_group"
                />
              </TabPanel>
              <TabPanel id="keyword">
                <GoogleAdsTable
                  websiteId={websiteId}
                  startDate={startDate}
                  endDate={endDate}
                  dimension="keyword"
                />
              </TabPanel>
            </Tabs>
          </Panel>
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
  const t = useTranslations('googleAds');
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
  const t = useTranslations('googleAds');

  return (
    <Panel>
      <EmptyPlaceholder
        icon={<Megaphone />}
        title={t(problem)}
        description={t(`${problem}Description`)}
      >
        <Button variant="primary" onPress={() => window.open(INTEGRATIONS_URL, '_blank')}>
          {t('manageIntegrations')}
        </Button>
      </EmptyPlaceholder>
    </Panel>
  );
}
