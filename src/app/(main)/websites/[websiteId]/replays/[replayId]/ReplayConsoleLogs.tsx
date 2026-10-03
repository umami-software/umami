import { Column, Row, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { useMessages } from '@/components/hooks';
import { getReplayConsoleLogs } from '@/lib/replay';
import styles from './ReplayConsoleLogs.module.css';

function formatOffset(timestamp: number, startTimestamp: number) {
  const seconds = Math.max(0, Math.floor((timestamp - startTimestamp) / 1000));

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ReplayConsoleLogs({ events }: { events: any[] }) {
  const { t, labels } = useMessages();
  const logs = useMemo(() => getReplayConsoleLogs(events), [events]);

  if (!logs.length) {
    return null;
  }

  const startTimestamp = Number(events[0]?.timestamp) || logs[0].timestamp;

  return (
    <Column gap="2">
      <Row justifyContent="space-between" alignItems="center">
        <Text weight="bold">{t(labels.consoleLevel)}</Text>
        <Text color="muted">{t(labels.numberOfRecords, { x: logs.length })}</Text>
      </Row>
      <Column gap="1" className={styles.logs}>
        {logs.map((log, index) => (
          <Row key={`${log.timestamp}-${index}`} gap="3" alignItems="flex-start">
            <Text color="muted" className={styles.offset}>
              {formatOffset(log.timestamp, startTimestamp)}
            </Text>
            <Text className={styles.level}>{log.level}</Text>
            <Text className={styles.message}>{log.message}</Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
