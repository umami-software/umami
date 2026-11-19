import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useRealtimeQuery } from '@/components/hooks';
import { RealtimeChart } from '@/components/metrics/RealtimeChart';

export function BoardRealtimeChart({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useRealtimeQuery(websiteId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="320px">
      <RealtimeChart data={data} unit="minute" />
    </LoadingPanel>
  );
}
