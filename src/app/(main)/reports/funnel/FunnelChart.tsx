import { useContext } from 'react';
import classNames from 'classnames';
import { useMessages } from 'components/hooks';
import { ReportContext } from '../[reportId]/Report';
import styles from './FunnelChart.module.css';
import { formatLongNumber } from 'lib/format';

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
      {data?.map(({ url, visitors, dropped, dropoff, remaining }, index: number) => {
        return (
          <div key={url} className={styles.step}>
            <div className={styles.num}>{index + 1}</div>
            <div className={styles.card}>
              <div className={styles.header}>
                <span className={styles.label}>{formatMessage(labels.viewedPage)}:</span>
                <span className={styles.item}>{url}</span>
              </div>
              <div className={styles.track}>
                <div className={styles.bar} style={{ width: `${remaining * 100}%` }}>
                  <span className={styles.value}>
                    {remaining > 0.1 && `${(remaining * 100).toFixed(2)}%`}
                  </span>
                </div>
              </div>
              <div className={styles.info}>
                <div>
                  <b>{formatLongNumber(visitors)}</b>
                  <span> {formatMessage(labels.visitors)}</span>
                  <span> ({(remaining * 100).toFixed(2)}%)</span>
                </div>
                {dropoff > 0 && (
                  <div>
                    <b>{formatLongNumber(dropped)}</b> {formatMessage(labels.visitorsDroppedOff)} (
                    {(dropoff * 100).toFixed(2)}%)
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FunnelChart;
