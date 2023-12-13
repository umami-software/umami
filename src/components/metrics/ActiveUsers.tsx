import { useMemo } from 'react';
import { StatusLight } from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import styles from './ActiveUsers.module.css';

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
  const { get, useQuery } = useApi();
  const { data } = useQuery({
    queryKey: ['websites:active', websiteId],
    queryFn: () => get(`/websites/${websiteId}/active`),
    enabled: !!websiteId,
    refetchInterval,
  });

  const count = useMemo(() => {
    if (websiteId) {
      return data?.[0]?.x || 0;
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

  if (count === 0) {
    return null;
  }

  return (
    <StatusLight className={styles.container} variant="success">
      <div className={styles.text}>{formatMessage(messages.activeUsers, { x: count })}</div>
    </StatusLight>
  );
}

export default ActiveUsers;
