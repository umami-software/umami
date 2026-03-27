'use client';
import { useLoginQuery, useUserWebsitesQuery } from '@/components/hooks';
import { type OverviewRange } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { WebsiteSummaryCard } from './WebsiteSummaryCard';

export function WebsitesOverview({ teamId, range = '24h' }: { teamId?: string; range?: OverviewRange }) {
  const { user } = useLoginQuery();
  const queryResult = useUserWebsitesQuery({ userId: user?.id, teamId }, { pageSize: 100 });
  const websites = (queryResult.data?.data ?? []) as { id: string; name: string; domain: string }[];

  if (queryResult.isLoading) {
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
      {websites.map(website => (
        <WebsiteSummaryCard key={website.id} website={website} range={range} />
      ))}
    </div>
  );
}
