import { Column, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useActiveUsersQuery, useMessages } from '@/components/hooks';
import { REALTIME_INTERVAL } from '@/lib/constants';

export function BoardRealtimeActiveUsers({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { data, isLoading, error } = useActiveUsersQuery(websiteId, {
    refetchInterval: REALTIME_INTERVAL,
  });
  const count = data?.visitors ?? 0;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error} minHeight="136px">
      <Column alignItems="center" justifyContent="center" height="100%" gap="2">
        <Text size="6xl" weight="bold">
          {count}
        </Text>
        <Text size="sm" color="muted">
          {t(labels.online)}
        </Text>
      </Column>
    </LoadingPanel>
  );
}
