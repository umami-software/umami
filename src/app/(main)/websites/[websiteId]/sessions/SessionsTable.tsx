import Link from 'next/link';
import { DataColumn, DataTable } from '@umami/react-zen';
import { useFormat, useMessages, useTimezone } from '@/components/hooks';
import { Avatar } from '@/components/common/Avatar';
import styles from './SessionsTable.module.css';
import { TypeIcon } from '@/components/common/TypeIcon';

export function SessionsTable({ data = [] }: { data: any[]; showDomain?: boolean }) {
  const { formatTimezoneDate } = useTimezone();
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();

  return (
    <DataTable data={data}>
      <DataColumn id="id" label={formatMessage(labels.session)} width="100px">
        {(row: any) => (
          <Link href={`sessions/${row.id}`} className={styles.link}>
            <Avatar seed={row.id} size={64} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="visits" label={formatMessage(labels.visits)} width="80px" />
      <DataColumn id="views" label={formatMessage(labels.views)} width="80px" />
      <DataColumn id="country" label={formatMessage(labels.country)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="city" label={formatMessage(labels.city)} />
      <DataColumn id="browser" label={formatMessage(labels.browser)}>
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={formatMessage(labels.os)}>
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={formatMessage(labels.device)}>
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="lastAt" label={formatMessage(labels.lastSeen)}>
        {(row: any) => formatTimezoneDate(row.createdAt, 'PPPpp')}
      </DataColumn>
    </DataTable>
  );
}
