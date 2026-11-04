'use client';
import { Button, Column, Heading, Loading, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { differenceInCalendarDays, format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { SearchConsoleChart } from '@/app/(main)/websites/[websiteId]/search-console/SearchConsoleChart';
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
import { formatLongNumber } from '@/lib/format';
import { formatConversions, formatMoney, formatPercent, getCtr } from './format';
import { GoogleAdsTable } from './GoogleAdsTable';

const INTEGRATIONS_URL = `${process.env.cloudUrl || ''}/settings/integrations`;

// Cloud rejects longer ranges. Narrowing the range here instead would show a lower total
// spend under a date filter that still says "All time".
const MAX_RANGE_DAYS = 731;

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
  } = useDateRange({ timezone });

  // Google reports whole days, so the page works in calendar days. useDateRange returns new
  // Date objects on every render (and relative ranges move with the clock), so keying the
  // dates on the day keeps the chart from redrawing on unrelated re-renders, such as the
  // subscription refetch that runs when the window regains focus.
  const startDay = format(rangeStart, 'yyyy-MM-dd');
  const endDay = format(rangeEnd, 'yyyy-MM-dd');
  const startDate = useMemo(() => new Date(`${startDay}T00:00:00`), [startDay]);
  const endDate = useMemo(() => new Date(`${endDay}T23:59:59.999`), [endDay]);
  const isRangeTooLong = differenceInCalendarDays(endDate, startDate) > MAX_RANGE_DAYS;

  // One row per day drives both the totals and the chart.
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
              <GoogleAdsMetrics rows={daily.data.rows} currency={daily.data.currencyCode} />
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
                <SearchConsoleChart
                  rows={daily.data.rows}
                  minDate={startDate}
                  maxDate={endDate}
                  unit={unit}
                />
              )}
            </LoadingPanel>
          </Panel>
          <Panel>
            <Tabs>
              <Heading size="2xl">{t('ads')}</Heading>
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

function GoogleAdsMetrics({ rows, currency }: { rows: GoogleAdsRow[]; currency: string | null }) {
  const t = useTranslations('googleAds');
  const { locale } = useLocale();
  const sum = (metric: 'cost' | 'clicks' | 'impressions' | 'conversions') =>
    rows.reduce((total, row) => total + row[metric], 0);
  const clicks = sum('clicks');
  const impressions = sum('impressions');

  return (
    <MetricsBar>
      <MetricCard
        value={sum('cost')}
        label={t('cost')}
        formatValue={(n: number) => formatMoney(n, currency, locale)}
      />
      <MetricCard value={clicks} label={t('clicks')} formatValue={formatLongNumber} />
      <MetricCard value={impressions} label={t('impressions')} formatValue={formatLongNumber} />
      <MetricCard
        value={getCtr({ clicks, impressions })}
        label={t('ctr')}
        formatValue={formatPercent}
      />
      <MetricCard
        value={sum('conversions')}
        label={t('conversions')}
        formatValue={formatConversions}
      />
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
