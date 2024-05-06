import { useContext } from 'react';
import classNames from 'classnames';
import { useMessages } from 'components/hooks';
import { ReportContext } from '../[reportId]/Report';
import { formatLongNumber } from 'lib/format';
import styles from './GoalsChart.module.css';

export function GoalsChart({ className }: { className?: string; isLoading?: boolean }) {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { data } = report || {};

  return (
    <div className={classNames(styles.chart, className)}>
      {data?.map(({ type, value, goal, result }, index: number) => {
        return (
          <div key={index} className={styles.step}>
            <div className={styles.num}>{index + 1}</div>
            <div className={styles.card}>
              <div className={styles.header}>
                <span className={styles.label}>
                  {formatMessage(type === 'url' ? labels.viewedPage : labels.triggeredEvent)}
                </span>
                <span className={styles.item}>{value}</span>
              </div>
              <div className={styles.metric}>
                <div>
                  <span className={styles.visitors}>{formatLongNumber(result)}</span>
                  {formatMessage(labels.visitors)}
                </div>
                <div>
                  <span className={styles.visitors}>{formatLongNumber(goal)}</span>
                  {formatMessage(labels.goal)}
                </div>
                <div className={styles.percent}>{((result / goal) * 100).toFixed(2)}%</div>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{ width: `${result > goal ? 100 : (result / goal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GoalsChart;
