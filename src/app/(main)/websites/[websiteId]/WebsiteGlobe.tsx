import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useRealtimeQuery } from '@/components/hooks';
import { RealtimeGlobe } from '@/components/metrics/RealtimeGlobe';

export function WebsiteGlobe({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useRealtimeQuery(websiteId);

  return (
    <Panel justifyContent="center">
      <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="420px">
        {data && <RealtimeGlobe data={data} />}
      </LoadingPanel>
    </Panel>
  );
}
