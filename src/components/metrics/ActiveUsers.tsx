import { useMemo } from 'react';
import { Text, StatusLight } from '@umami/react-zen';
import { useMessages, useActyiveUsersQuery } from '@/components/hooks';

export function ActiveUsers({
  websiteId,
  value,
  refetchInterval = 60000,
}: {
  websiteId: string;
  value?: number;
  refetchInterval?: number;
}) {
  const { formatMessage, messages } = useMessages();
  const { data } = useActyiveUsersQuery(websiteId, { refetchInterval });

  const count = useMemo(() => {
    if (websiteId) {
      return data?.visitors || 0;
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

  if (count === 0) {
    return null;
  }

  return (
    <StatusLight variant="success">
      <Text size="2" weight="bold">
        {formatMessage(messages.activeUsers, { x: count })}
      </Text>
    </StatusLight>
  );
}
