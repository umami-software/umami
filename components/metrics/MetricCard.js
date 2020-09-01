import React from 'react';
import { useSpring, animated } from 'react-spring';
import { formatNumber } from '../../lib/format';
import styles from './MetricCard.module.css';

const MetricCard = ({ value = 0, label, format = formatNumber }) => {
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });

  return (
    <div className={styles.card}>
      <animated.div className={styles.value}>{props.x.interpolate(x => format(x))}</animated.div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default MetricCard;
