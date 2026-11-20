'use client';
import { useMessages } from '@/components/hooks';
import { useAllWebsitesStatsQuery } from '@/components/hooks/queries/useAllWebsitesStatsQuery';
import { formatLongNumber, formatShortTime } from '@/lib/format';
import { MetricsBar } from './MetricsBar';
import { StatCard } from './StatCard';

export function AllWebsitesMetricsBar() {
  const { t, labels } = useMessages();
  const { data, isLoading } = useAllWebsitesStatsQuery();
  const { websites = [], totals, series } = data || {};

  const bounceRate =
    totals?.visits > 0 ? Math.min(100, Math.round((totals.bounces / totals.visits) * 100)) : 0;
  const avgDuration = totals?.visits > 0 ? totals.totaltime / totals.visits : 0;

  return (
    <MetricsBar>
      <StatCard label={t(labels.websites)} value={websites.length} isLoading={isLoading} />
      <StatCard
        label={t(labels.visitors)}
        value={formatLongNumber(totals?.visitors ?? 0)}
        isLoading={isLoading}
      />
      <StatCard
        label={t(labels.visits)}
        value={formatLongNumber(totals?.visits ?? 0)}
        isLoading={isLoading}
      />
      <StatCard
        label={t(labels.views)}
        value={formatLongNumber(totals?.pageviews ?? 0)}
        isLoading={isLoading}
        sparkData={series}
      />
      <StatCard label={t(labels.bounceRate)} value={`${bounceRate}%`} isLoading={isLoading} />
      <StatCard
        label={t(labels.visitDuration)}
        value={formatShortTime(Math.round(avgDuration), ['m', 's'], ' ')}
        isLoading={isLoading}
      />
    </MetricsBar>
  );
}
