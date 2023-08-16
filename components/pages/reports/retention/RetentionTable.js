import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import classNames from 'classnames';
import { ReportContext } from '../Report';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { useMessages } from 'hooks';
import { formatDate } from 'lib/date';
import styles from './RetentionTable.module.css';

export function RetentionTable() {
  const { formatMessage, labels } = useMessages();
  const { report } = useContext(ReportContext);
  const { data } = report || {};

  if (!data) {
    return <EmptyPlaceholder />;
  }

  const rows = data.reduce((arr, { date, visitors }) => {
    if (!arr.find(a => a.date === date)) {
      return arr.concat({ date, visitors });
    }
    return arr;
  }, []);

  const days = [1, 2, 3, 4, 5, 6, 7, 14, 21, 30];

  return (
    <>
      <div className={styles.table}>
        <div className={classNames(styles.row, styles.header)}>
          <div className={styles.date}>{formatMessage(labels.date)}</div>
          <div className={styles.visitors}>{formatMessage(labels.visitors)}</div>
          {days.map(n => (
            <div key={n} className={styles.day}>
              {formatMessage(labels.day)} {n}
            </div>
          ))}
        </div>
        {rows.map(({ date, visitors }, i) => {
          return (
            <div key={i} className={styles.row}>
              <div className={styles.date}>{formatDate(`${date} 00:00:00`, 'PP')}</div>
              <div className={styles.visitors}>{visitors}</div>
              {days.map((n, day) => {
                return (
                  <div key={day} className={styles.cell}>
                    {data.find(row => row.date === date && row.day === day)?.percentage.toFixed(2)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <DataTable data={data} />
    </>
  );
}

function DataTable({ data }) {
  return (
    <GridTable data={data || []}>
      <GridColumn name="date" label={'Date'}>
        {row => row.date}
      </GridColumn>
      <GridColumn name="day" label={'Day'}>
        {row => row.day}
      </GridColumn>
      <GridColumn name="visitors" label={'Visitors'}>
        {row => row.visitors}
      </GridColumn>
      <GridColumn name="returnVisitors" label={'Return Visitors'}>
        {row => row.returnVisitors}
      </GridColumn>
      <GridColumn name="percentage" label={'Percentage'}>
        {row => row.percentage}
      </GridColumn>
    </GridTable>
  );
}

export default RetentionTable;
