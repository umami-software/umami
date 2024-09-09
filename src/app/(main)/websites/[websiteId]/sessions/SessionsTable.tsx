import Link from 'next/link';
import { GridColumn, GridTable } from 'react-basics';
import { useFormat, useMessages, useTimezone } from 'components/hooks';
import Avatar from 'components/common/Avatar';
import styles from './SessionsTable.module.css';
import TypeIcon from 'components/common/TypeIcon';
import { useIntl } from 'react-intl';
import { formatLongNumberOptions } from 'lib/format';

export function SessionsTable({ data = [] }: { data: any[]; showDomain?: boolean }) {
  const intl = useIntl();
  const { formatTimezoneDate } = useTimezone();
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
      <GridColumn name="visits" label={formatMessage(labels.visits)} width="100px">
        {row => (
          <span title={intl.formatNumber(row.visits)}>
            {intl.formatNumber(row.visits, formatLongNumberOptions(row.visits))}
          </span>
        )}
      </GridColumn>
      <GridColumn name="views" label={formatMessage(labels.views)} width="100px">
        {row => (
          <span title={intl.formatNumber(row.views)}>
            {intl.formatNumber(row.views, formatLongNumberOptions(row.views))}
          </span>
        )}
      </GridColumn>
      <GridColumn name="country" label={formatMessage(labels.country)}>
        {row => (
          <TypeIcon type="country" value={row.country}>
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </GridColumn>
      <GridColumn name="city" label={formatMessage(labels.city)} />
      <GridColumn name="browser" label={formatMessage(labels.browser)}>
        {row => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </GridColumn>
      <GridColumn name="os" label={formatMessage(labels.os)}>
        {row => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </GridColumn>
      <GridColumn name="device" label={formatMessage(labels.device)}>
        {row => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </GridColumn>
      <GridColumn name="lastAt" label={formatMessage(labels.lastSeen)}>
        {row => formatTimezoneDate(intl, row.createdAt, { dateStyle: 'long', timeStyle: 'medium' })}
      </GridColumn>
    </GridTable>
  );
}

export default SessionsTable;
