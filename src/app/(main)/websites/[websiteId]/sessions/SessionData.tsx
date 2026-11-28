import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useSessionDataQuery } from '@/components/hooks';
import { DATA_TYPES } from '@/lib/constants';
import { getDisplayValue } from '@/lib/data';
import styles from './SessionData.module.css';

export function SessionData({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { data, isLoading, error } = useSessionDataQuery(websiteId, sessionId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <div className={styles.root}>
        {!data?.length ? (
          <Empty />
        ) : (
          <div className={styles.list}>
            {data.map(row => (
              <div key={row.dataKey} className={styles.row}>
                <span className={styles.key} title={row.dataKey}>
                  <span className={styles.keyText}>{row.dataKey}</span>
                </span>
                <span className={styles.value}>{getDisplayValue(row)}</span>
                <span className={styles.type}>{DATA_TYPES[row.dataType]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </LoadingPanel>
  );
}
