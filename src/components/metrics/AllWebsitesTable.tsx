'use client';
import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useAllWebsitesStatsQuery } from '@/components/hooks/queries/useAllWebsitesStatsQuery';
import { WebsiteStatsTable } from './WebsiteStatsTable';

export function AllWebsitesTable({ limit = 10 }: { limit?: number | string }) {
  const { data, isLoading, error } = useAllWebsitesStatsQuery();

  const websites = useMemo(() => {
    return [...(data?.websites ?? [])]
      .sort((a, b) => (b.stats?.visitors ?? 0) - (a.stats?.visitors ?? 0))
      .slice(0, Number(limit) || 10);
  }, [data?.websites, limit]);

  return (
    <LoadingPanel data={data?.websites} isLoading={isLoading} error={error}>
      <WebsiteStatsTable websites={websites} />
    </LoadingPanel>
  );
}
