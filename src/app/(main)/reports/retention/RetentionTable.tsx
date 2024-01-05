import { useContext } from 'react';
import classNames from 'classnames';
import { ReportContext } from '../[id]/Report';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { useMessages, useLocale } from 'components/hooks';
import { formatDate } from 'lib/date';
import styles from './RetentionTable.module.css';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];

export function RetentionTable({ days = DAYS }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { report } = useContext(ReportContext);
  const { data } = report || {};

  if (!data) {
    return <EmptyPlaceholder />;
  }

  const rows = data.reduce((arr: any[], row: { date: any; visitors: any; day: any }) => {
    const { date, visitors, day } = row;
    if (day === 0) {
      return arr.concat({
        date,
        visitors,
        records: days
          .reduce((arr, day) => {
            arr[day] = data.find(x => x.date === date && x.day === day);
            return arr;
          }, [])
          .filter(n => n),
      });
    }
    return arr;
  }, []);

  const totalDays = rows.length;

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
        {rows.map(({ date, visitors, records }, rowIndex) => {
          return (
            <div key={rowIndex} className={styles.row}>
              <div className={styles.date}>{formatDate(`${date} 00:00:00`, 'PP', locale)}</div>
              <div className={styles.visitors}>{visitors}</div>
              {days.map(day => {
                if (totalDays - rowIndex < day) {
                  return null;
                }
                const percentage = records[day]?.percentage;
                return (
                  <div
                    key={day}
                    className={classNames(styles.cell, { [styles.empty]: !percentage })}
                  >
                    {percentage ? `${percentage.toFixed(2)}%` : ''}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default RetentionTable;
