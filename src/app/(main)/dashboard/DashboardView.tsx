'use client';
import { Column, Grid, Loading, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { useApi, useDateRange, useMessages, useNavigation, useTimezone } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { parseDateRange } from '@/lib/date';
import { WebsiteStatsTable } from './WebsiteStatsTable';
import { StatCard } from './StatCard';

interface WebsiteItem {
  id: string;
  name: string;
  domain: string;
}

interface StatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

interface PageviewPoint {
  x: string;
  y: number;
}

interface PageviewsData {
  pageviews: PageviewPoint[];
  sessions: PageviewPoint[];
}

export interface WebsiteWithStats extends WebsiteItem {
  stats: StatsData;
  visitorSeries?: number[];
  pageviewSeries?: number[];
}

export function DashboardView({ defaultDate = '30day' }: { defaultDate?: string }) {
  const { get, useQuery } = useApi();
  const { formatMessage, labels } = useMessages();
  const {
    query: { date = '' },
  } = useNavigation();
  const { dateRange } = useDateRange();
  const { timezone, localToUtc, canonicalizeTimezone } = useTimezone();

  const { startAt, endAt, unit } = useMemo(() => {
    const range = date ? dateRange : parseDateRange(defaultDate);
    return {
      startAt: +localToUtc(range.startDate),
      endAt: +localToUtc(range.endDate),
      unit: range.unit,
    };
  }, [date, dateRange, defaultDate, localToUtc]);

  const tz = canonicalizeTimezone(timezone);

  const {
    data: websitesData,
    isLoading: isLoadingWebsites,
    error: websitesError,
  } = useQuery({
    queryKey: ['dashboard:websites'],
    queryFn: () => get('/me/websites', { pageSize: 100 }),
  });

  const websites: WebsiteItem[] = websitesData?.data || [];

  const { data: allStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard:stats', { websiteIds: websites.map(w => w.id), startAt, endAt }],
    queryFn: async () => {
      const results = await Promise.all(
        websites.map(async website => {
          const [stats, pageviews] = await Promise.all([
            get(`/websites/${website.id}/stats`, {
              startAt,
              endAt,
              unit,
              timezone: tz,
            }),
            get(`/websites/${website.id}/pageviews`, {
              startAt,
              endAt,
              unit,
              timezone: tz,
            }) as Promise<PageviewsData>,
          ]);
          return {
            ...website,
            stats,
            visitorSeries: pageviews?.sessions?.map((p: PageviewPoint) => p.y) || [],
            pageviewSeries: pageviews?.pageviews?.map((p: PageviewPoint) => p.y) || [],
          } as WebsiteWithStats;
        }),
      );
      return results;
    },
    enabled: websites.length > 0,
  });

  const websitesWithStats: WebsiteWithStats[] = allStats || [];

  const { aggregateVisitorSeries, aggregatePageviewSeries } = useMemo(() => {
    if (!websitesWithStats.length)
      return { aggregateVisitorSeries: [], aggregatePageviewSeries: [] };
    const maxLen = Math.max(...websitesWithStats.map(w => w.visitorSeries?.length || 0));
    if (!maxLen) return { aggregateVisitorSeries: [], aggregatePageviewSeries: [] };
    const visitors: number[] = new Array(maxLen).fill(0);
    const pageviews: number[] = new Array(maxLen).fill(0);
    websitesWithStats.forEach(w => {
      w.visitorSeries?.forEach((v, i) => {
        visitors[i] += v;
      });
      w.pageviewSeries?.forEach((v, i) => {
        pageviews[i] += v;
      });
    });
    return { aggregateVisitorSeries: visitors, aggregatePageviewSeries: pageviews };
  }, [websitesWithStats]);

  if (isLoadingWebsites) {
    return <Loading placement="absolute" />;
  }

  if (websitesError) {
    return <Text>Failed to load websites.</Text>;
  }

  if (websites.length === 0) {
    return (
      <Panel>
        <Text color="muted">No websites found. Add a website to get started.</Text>
      </Panel>
    );
  }

  const isLoading = isLoadingStats;

  const totals = websitesWithStats.reduce(
    (acc, { stats }) => ({
      visitors: acc.visitors + (stats?.visitors || 0),
      pageviews: acc.pageviews + (stats?.pageviews || 0),
      visits: acc.visits + (stats?.visits || 0),
      bounces: acc.bounces + (stats?.bounces || 0),
      totaltime: acc.totaltime + (stats?.totaltime || 0),
    }),
    { visitors: 0, pageviews: 0, visits: 0, bounces: 0, totaltime: 0 },
  );

  const bounceRate = totals.visits > 0 ? Math.round((totals.bounces / totals.visits) * 100) : 0;
  const avgDuration = totals.visits > 0 ? Math.round(totals.totaltime / totals.visits) : 0;

  return (
    <Column gap="6">
      <Grid columns={{ xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap="4">
        <StatCard
          label={formatMessage(labels.uniqueVisitors)}
          value={totals.visitors}
          isLoading={isLoading}
          sparkData={aggregateVisitorSeries}
        />
        <StatCard
          label={formatMessage(labels.pageViews)}
          value={totals.pageviews}
          isLoading={isLoading}
          sparkData={aggregatePageviewSeries}
        />
        <StatCard
          label={formatMessage(labels.bounceRate)}
          value={`${bounceRate}%`}
          isLoading={isLoading}
        />
        <StatCard
          label={formatMessage(labels.visitDuration)}
          value={formatDuration(avgDuration)}
          isLoading={isLoading}
        />
      </Grid>
      <Panel title={formatMessage(labels.websites)}>
        <WebsiteStatsTable websites={websitesWithStats} isLoading={isLoading} />
      </Panel>
    </Column>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
