import { Loading, TextOverflow } from 'react-basics';
import { useMessages, useSessionData } from 'components/hooks';
import Empty from 'components/common/Empty';
import styles from './SessionData.module.css';
import { DATA_TYPES } from 'lib/constants';

export function SessionData({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading } = useSessionData(websiteId, sessionId);

  if (isLoading) {
    return <Loading icon="dots" size="sm" />;
  }

  return (
    <div className={styles.data}>
      <div className={styles.header}>{formatMessage(labels.properties)}</div>
      {!data?.length && <Empty className={styles.empty} />}
      {data?.map(({ dataKey, dataType, stringValue }) => {
        return (
          <div key={dataKey}>
            <div className={styles.label}>
              <div className={styles.name}>
                <TextOverflow>{dataKey}</TextOverflow>
              </div>
              <div className={styles.type}>{DATA_TYPES[dataType]}</div>
            </div>
            <div className={styles.value}>{stringValue}</div>
          </div>
        );
      })}
    </div>
  );
}
