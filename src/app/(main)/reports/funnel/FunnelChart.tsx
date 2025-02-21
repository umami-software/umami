import { useContext } from 'react';
import classNames from 'classnames';
import { useMessages } from '@/components/hooks';
import { ReportContext } from '../[reportId]/Report';
import { formatLongNumber } from '@/lib/format';
import styles from './FunnelChart.module.css';

export interface FunnelChartProps {
  className?: string;
  isLoading?: boolean;
}

export function FunnelChart({ className }: FunnelChartProps) {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { data } = report || {};

  return (
    <div className={classNames(styles.chart, className)}>
      {data?.map(({ type, value, visitors, dropped, dropoff, remaining }, index: number) => {
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
                  <span className={styles.visitors}>{formatLongNumber(visitors)}</span>
                  {formatMessage(labels.visitors)}
                </div>
                <div className={styles.percent}>{(remaining * 100).toFixed(2)}%</div>
              </div>
              <div className={styles.track}>
                <div className={styles.bar} style={{ width: `${remaining * 100}%` }}></div>
              </div>
              {dropoff > 0 && (
                <div className={styles.info}>
                  <b>{formatLongNumber(dropped)}</b> {formatMessage(labels.visitorsDroppedOff)} (
                  {(dropoff * 100).toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FunnelChart;
