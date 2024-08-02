import Link from 'next/link';
import { GridColumn, GridTable, useBreakpoint } from 'react-basics';
import { useFormat, useLocale, useMessages } from 'components/hooks';
import Avatar from 'components/common/Avatar';
import styles from './SessionsTable.module.css';
import { formatDate } from 'lib/date';

export function SessionsTable({ data = [] }: { data: any[]; showDomain?: boolean }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const breakpoint = useBreakpoint();
  const { formatValue } = useFormat();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="id" label="ID" width="300px">
        {row => (
          <Link href={`sessions/${row.id}`} className={styles.link}>
            <Avatar key={row.id} seed={row.id} size={64} />
            {row.id}
          </Link>
        )}
      </GridColumn>
      <GridColumn name="visits" label={formatMessage(labels.visits)} width="100px" />
      <GridColumn name="country" label={formatMessage(labels.country)}>
        {row => formatValue(row.country, 'country')}
      </GridColumn>
      <GridColumn name="city" label={formatMessage(labels.city)} />
      <GridColumn name="browser" label={formatMessage(labels.browser)}>
        {row => formatValue(row.browser, 'browser')}
      </GridColumn>
      <GridColumn name="os" label={formatMessage(labels.os)} />
      <GridColumn name="device" label={formatMessage(labels.device)}>
        {row => formatValue(row.device, 'device')}
      </GridColumn>
      <GridColumn name="lastAt" label={formatMessage(labels.lastSeen)}>
        {row => formatDate(new Date(row.lastAt), 'PPPpp', locale)}
      </GridColumn>
    </GridTable>
  );
}

export default SessionsTable;
