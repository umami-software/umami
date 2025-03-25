import { Text } from '@umami/react-zen';
import { useMessages, useSessionDataQuery } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DATA_TYPES } from '@/lib/constants';
import styles from './SessionData.module.css';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export function SessionData({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, ...query } = useSessionDataQuery(websiteId, sessionId);

  return (
    <>
      <div className={styles.header}>{formatMessage(labels.properties)}</div>
      <LoadingPanel className={styles.data} {...query} data={data}>
        {!data?.length && <Empty className={styles.empty} />}
        {data?.map(({ dataKey, dataType, stringValue }) => {
          return (
            <div key={dataKey}>
              <div className={styles.label}>
                <div className={styles.name}>
                  <Text>{dataKey}</Text>
                </div>
                <div className={styles.type}>{DATA_TYPES[dataType]}</div>
              </div>
              <div className={styles.value}>{stringValue}</div>
            </div>
          );
        })}
      </LoadingPanel>
    </>
  );
}
