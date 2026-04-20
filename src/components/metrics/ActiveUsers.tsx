import { StatusLight, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import Link from '@/components/common/Link';
import { useActiveUsersQuery, useMessages } from '@/components/hooks';

export function ActiveUsers({
  websiteId,
  value,
  refetchInterval = 60000,
  allowLink = true,
}: {
  websiteId: string;
  value?: number;
  refetchInterval?: number;
  allowLink?: boolean;
}) {
  const { t, labels } = useMessages();
  const { data } = useActiveUsersQuery(websiteId, { refetchInterval });

  const count = useMemo(() => {
    if (websiteId) {
      return data?.visitors || 0;
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

  if (count === 0) {
    return null;
  }

  const content = (
    <StatusLight variant="success">
      <Text size="sm" weight="medium">
        {count} {t(labels.online)}
      </Text>
    </StatusLight>
  );

  if (!allowLink) {
    return content;
  }

  return <Link href={`/websites/${websiteId}/realtime`}>{content}</Link>;
}