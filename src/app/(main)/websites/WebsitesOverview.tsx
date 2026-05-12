'use client';
import { useMemo } from 'react';
import { useLoginQuery, useUserWebsitesQuery } from '@/components/hooks';
import { type OverviewRange } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { type SortField, useAllWebsiteStatsQuery } from '@/components/hooks/queries/useAllWebsiteStatsQuery';
import { WebsiteSummaryCard } from './WebsiteSummaryCard';

interface Website {
  id: string;
  name: string;
  domain: string;
}

export function WebsitesOverview({
  teamId,
  range = '24h',
  sort = 'name',
}: {
  teamId?: string;
  range?: OverviewRange;
  sort?: SortField;
}) {
  const { user } = useLoginQuery();
  const queryResult = useUserWebsitesQuery({ userId: user?.id, teamId }, { pageSize: 100 });
  const websites = (queryResult.data?.data ?? []) as Website[];

  const websiteIds = useMemo(() => websites.map(w => w.id), [websites]);
  const needsStats = sort !== 'name';
  const { data: allStats, isLoading: statsLoading } = useAllWebsiteStatsQuery(
    websiteIds,
    range,
    needsStats && websiteIds.length > 0,
  );

  const sortedWebsites = useMemo(() => {
    if (sort === 'name' || !allStats) {
      return [...websites].sort((a, b) => a.name.localeCompare(b.name));
    }

    return [...websites].sort((a, b) => {
      const aVal = allStats[a.id]?.[sort] ?? 0;
      const bVal = allStats[b.id]?.[sort] ?? 0;
      return bVal - aVal;
    });
  }, [websites, allStats, sort]);

  const isLoading = queryResult.isLoading || (needsStats && statsLoading);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--base-100)',
                height: '140px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
      </div>
    );
  }

  if (!websites.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-500)', padding: '48px 0' }}>
        No websites tracked yet.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      {sortedWebsites.map(website => (
        <WebsiteSummaryCard key={website.id} website={website} range={range} />
      ))}
    </div>
  );
}
