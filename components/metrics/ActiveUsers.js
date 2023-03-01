import { useMemo } from 'react';
import { StatusLight } from 'react-basics';
import { useIntl } from 'react-intl';
import useApi from 'hooks/useApi';
import { messages } from 'components/messages';
import styles from './ActiveUsers.module.css';

export default function ActiveUsers({ websiteId, value, refetchInterval = 60000 }) {
  const { formatMessage } = useIntl();
  const { get, useQuery } = useApi();
  const { data } = useQuery(
    ['websites:active', websiteId],
    () => get(`/websites/${websiteId}/active`),
    {
      refetchInterval,
      enabled: !!websiteId,
    },
  );

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
    <StatusLight variant="success">
      <div className={styles.text}>{formatMessage(messages.activeUsers, { x: count })}</div>
    </StatusLight>
  );
}
