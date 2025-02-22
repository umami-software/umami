import { useContext } from 'react';
import classNames from 'classnames';
import { useMessages } from '@/components/hooks';
import { ReportContext } from '../[reportId]/Report';
import { formatLongNumber } from '@/lib/format';
import styles from './GoalsChart.module.css';

export function GoalsChart({ className }: { className?: string; isLoading?: boolean }) {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { data } = report || {};

  const getLabel = type => {
    let label = '';
    switch (type) {
      case 'url':
        label = labels.viewedPage;
        break;
      case 'event':
        label = labels.triggeredEvent;
        break;
      default:
        label = labels.collectedData;
        break;
    }

    return label;
  };

  return (
    <div className={classNames(styles.chart, className)}>
      {data?.map(({ type, value, goal, result, property, operator }, index: number) => {
        const percent = result > goal ? 100 : (result / goal) * 100;

        return (
          <div key={index} className={styles.goal}>
            <div className={styles.card}>
              <div className={styles.header}>
                <span className={styles.label}>{formatMessage(getLabel(type))}</span>
                <span className={styles.item}>{`${value}${
                  type === 'event-data' ? `:(${operator}):${property}` : ''
                }`}</span>
              </div>
              <div className={styles.track}>
                <div
                  className={classNames(
                    classNames(styles.bar, {
                      [styles.level1]: percent <= 20,
                      [styles.level2]: percent > 20 && percent <= 40,
                      [styles.level3]: percent > 40 && percent <= 60,
                      [styles.level4]: percent > 60 && percent <= 80,
                      [styles.level5]: percent > 80,
                    }),
                  )}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className={styles.metric}>
                <div className={styles.value}>
                  {formatLongNumber(result)}
                  <span className={styles.total}> / {formatLongNumber(goal)}</span>
                </div>
                <div className={styles.percent}>{((result / goal) * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GoalsChart;
