import { useContext } from 'react';
import classNames from 'classnames';
import { useMessages } from 'components/hooks';
import { ReportContext } from '../[reportId]/Report';
import { formatLongNumberOptions } from 'lib/format';
import { useIntl } from 'react-intl';
import styles from './FunnelChart.module.css';

export interface FunnelChartProps {
  className?: string;
  isLoading?: boolean;
}

export function FunnelChart({ className }: FunnelChartProps) {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const intl = useIntl();

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
                  <span className={styles.visitors}>
                    {intl.formatNumber(visitors, formatLongNumberOptions(visitors))}
                  </span>
                  {formatMessage(labels.visitors)}
                </div>
                <div className={styles.percent}>
                  {intl.formatNumber(remaining, { style: 'percent', maximumFractionDigits: 1 })}
                </div>
              </div>
              <div className={styles.track}>
                <div className={styles.bar} style={{ width: `${remaining * 100}%` }}></div>
              </div>
              {dropoff > 0 && (
                <div className={styles.info}>
                  <b>{intl.formatNumber(dropped, formatLongNumberOptions(dropped))}</b>{' '}
                  {formatMessage(labels.visitorsDroppedOff)} (
                  {intl.formatNumber(dropoff, { style: 'percent', maximumFractionDigits: 1 })})
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
