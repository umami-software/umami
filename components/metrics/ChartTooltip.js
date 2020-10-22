import React from 'react';
import Dot from 'components/common/Dot';
import styles from './ChartTooltip.module.css';
import ReactTooltip from 'react-tooltip';

export default function ChartTooltip({ chartId, tooltip }) {
  if (!tooltip) {
    return null;
  }

  const { title, value, label, labelColor } = tooltip;

  return (
    <ReactTooltip id={`${chartId}-tooltip`}>
      <div className={styles.tooltip}>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          <div className={styles.metric}>
            <Dot color={labelColor} />
            {value} {label}
          </div>
        </div>
      </div>
    </ReactTooltip>
  );
}
