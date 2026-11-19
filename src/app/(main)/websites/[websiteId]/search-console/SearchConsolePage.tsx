'use client';
import { Button, Column, Heading, Loading, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { GridRow } from '@/components/common/GridRow';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type SearchConsoleError,
  useDateRange,
  useMessages,
  useSearchConsoleQuery,
  useSubscription,
  useTimezone,
  useWebsite,
} from '@/components/hooks';
import { Search } from '@/components/icons';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { SearchConsoleChart } from './SearchConsoleChart';
import { SearchConsoleTable } from './SearchConsoleTable';

const INTEGRATIONS_URL = `${process.env.cloudUrl || ''}/settings/integrations`;

export function SearchConsolePage({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { hasFeature, cloudMode, isLoading } = useSubscription(website?.teamId);
  const isAllowed = !cloudMode || hasFeature('searchConsole');

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!isAllowed) {
    return <UpgradePlaceholder />;
  }

  return <SearchConsoleReport websiteId={websiteId} />;
}

function UpgradePlaceholder() {
  const t = useTranslations('searchConsole');
  const { t: tm, labels, messages } = useMessages();

  return (
    <Panel>
      <EmptyPlaceholder
        icon={<Search />}
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

function SearchConsoleReport({ websiteId }: { websiteId: string }) {
  const t = useTranslations('searchConsole');
  const { t: tm, labels } = useMessages();
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

  // One row per day drives both the totals and the chart.
  const daily = useSearchConsoleQuery({
    websiteId,
    startDate,
    endDate,
    dimension: 'date',
    limit: 1000,
  });

  const setupProblem = getSetupProblem(daily.error);
  // Cloud enforces the plan too; it wins if the dashboard's view of the plan is stale.
  const placeholder =
    daily.error?.code === 'subscription_required' ? (
      <UpgradePlaceholder />
    ) : (
      setupProblem && <SearchConsolePlaceholder problem={setupProblem} />
    );

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
            {daily.data && <SearchConsoleMetrics rows={daily.data.rows} />}
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
          <GridRow layout="two">
            <Panel>
              <Tabs>
                <Heading size="2xl">{t('searches')}</Heading>
                <TabList>
                  <Tab id="query">{t('queries')}</Tab>
                  <Tab id="page">{t('pages')}</Tab>
                </TabList>
                <TabPanel id="query">
                  <SearchConsoleTable
                    websiteId={websiteId}
                    startDate={startDate}
                    endDate={endDate}
                    dimension="query"
                  />
                </TabPanel>
                <TabPanel id="page">
                  <SearchConsoleTable
                    websiteId={websiteId}
                    startDate={startDate}
                    endDate={endDate}
                    dimension="page"
                  />
                </TabPanel>
              </Tabs>
            </Panel>
            <Panel>
              <Tabs>
                <Heading size="2xl">{tm(labels.audience)}</Heading>
                <TabList>
                  <Tab id="country">{t('countries')}</Tab>
                  <Tab id="device">{t('devices')}</Tab>
                </TabList>
                <TabPanel id="country">
                  <SearchConsoleTable
                    websiteId={websiteId}
                    startDate={startDate}
                    endDate={endDate}
                    dimension="country"
                  />
                </TabPanel>
                <TabPanel id="device">
                  <SearchConsoleTable
                    websiteId={websiteId}
                    startDate={startDate}
                    endDate={endDate}
                    dimension="device"
                  />
                </TabPanel>
              </Tabs>
            </Panel>
          </GridRow>
        </>
      )}
    </Column>
  );
}

function SearchConsoleMetrics({
  rows,
}: {
  rows: { clicks: number; impressions: number; position: number }[];
}) {
  const t = useTranslations('searchConsole');
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  // Google's average position is weighted by impressions.
  const position = impressions
    ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions
    : 0;
  const ctr = impressions ? clicks / impressions : 0;

  return (
    <MetricsBar>
      <MetricCard value={clicks} label={t('clicks')} formatValue={formatLongNumber} />
      <MetricCard value={impressions} label={t('impressions')} formatValue={formatLongNumber} />
      <MetricCard
        value={ctr}
        label={t('ctr')}
        formatValue={(n: number) => `${(n * 100).toFixed(1)}%`}
      />
      <MetricCard
        value={position}
        label={t('averagePosition')}
        formatValue={(n: number) => (n ? n.toFixed(1) : '-')}
      />
    </MetricsBar>
  );
}

type SetupProblem = 'notConnected' | 'propertyNotSet' | 'reconnect';

/**
 * Setup problems the customer fixes in Cloud settings, not by retrying. Anything else falls
 * through to the regular error display.
 */
function getSetupProblem(error?: SearchConsoleError | null): SetupProblem | null {
  switch (error?.code) {
    case 'not_connected':
      return 'notConnected';
    case 'property_not_set':
      return 'propertyNotSet';
    case 'authentication':
      return 'reconnect';
    default:
      return null;
  }
}

function SearchConsolePlaceholder({ problem }: { problem: SetupProblem }) {
  const t = useTranslations('searchConsole');

  return (
    <Panel>
      <EmptyPlaceholder
        icon={<Search />}
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
