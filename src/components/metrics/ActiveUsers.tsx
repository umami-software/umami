import { useMemo } from 'react';
import { Text, StatusLight } from '@umami/react-zen';
import { useMessages, useActyiveUsersQuery } from '@/components/hooks';
import { LinkButton } from '@/components/common/LinkButton';

export function ActiveUsers({
  websiteId,
  value,
  refetchInterval = 60000,
}: {
  websiteId: string;
  value?: number;
  refetchInterval?: number;
}) {
  const { formatMessage, labels } = useMessages();
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
    <LinkButton href={`/websites/${websiteId}/realtime`} variant="quiet">
      <StatusLight variant="success">
        <Text size="2" weight="medium">
          {count} {formatMessage(labels.online)}
        </Text>
      </StatusLight>
    </LinkButton>
  );
}
