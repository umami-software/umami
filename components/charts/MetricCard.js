import React from 'react';
import { useSpring, animated } from 'react-spring';
import styles from './MetricCard.module.css';

function defaultFormat(n) {
  return Number(n).toFixed(0);
}

const MetricCard = ({ value = 0, label, format = defaultFormat }) => {
  const props = useSpring({ x: value, from: { x: 0 } });

  return (
    <div className={styles.card}>
      <animated.div className={styles.value}>{props.x.interpolate(x => format(x))}</animated.div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default MetricCard;
