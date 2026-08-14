import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useRealtimeQuery } from '@/components/hooks';
import { RealtimeHeader } from './RealtimeHeader';

export function BoardRealtimeMetricsBar({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useRealtimeQuery(websiteId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="136px">
      <RealtimeHeader data={data} />
    </LoadingPanel>
  );
}
