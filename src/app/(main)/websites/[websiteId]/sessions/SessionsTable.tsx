import Link from 'next/link';
import { GridColumn, GridTable } from 'react-basics';
import { useFormat, useLocale, useMessages } from 'components/hooks';
import Avatar from 'components/common/Avatar';
import styles from './SessionsTable.module.css';
import { formatDate } from 'lib/date';
import TypeIcon from 'components/common/TypeIcon';

export function SessionsTable({ data = [] }: { data: any[]; showDomain?: boolean }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();

  return (
    <GridTable data={data}>
      <GridColumn name="id" label={formatMessage(labels.session)} width="100px">
        {row => (
          <Link href={`sessions/${row.id}`} className={styles.link}>
            <Avatar key={row.id} seed={row.id} size={64} />
          </Link>
        )}
      </GridColumn>
      <GridColumn name="visits" label={formatMessage(labels.visits)} width="100px" />
      <GridColumn name="views" label={formatMessage(labels.views)} width="100px" />
      <GridColumn name="country" label={formatMessage(labels.country)}>
        {row => (
          <TypeIcon type="country" value={row.country}>
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
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
