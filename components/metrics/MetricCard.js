import React from 'react';
import { useSpring, animated } from 'react-spring';
import { formatNumber } from '../../lib/format';
import styles from './MetricCard.module.css';

const MetricCard = ({
  value = 0,
  change = 0,
  label,
  reverseColors = false,
  format = formatNumber,
  hideComparison = false,
}) => {
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });
  const changeProps = useSpring({ x: Number(change) || 0, from: { x: 0 } });

  return (
    <div className={styles.card}>
      <animated.div className={styles.value}>{props.x.interpolate(x => format(x))}</animated.div>
      <div className={styles.label}>
        {label}
        {~~change !== 0 && !hideComparison && (
          <animated.span
            className={`${styles.change} ${
              change >= 0
                ? !reverseColors
                  ? styles.positive
                  : styles.negative
                : !reverseColors
                ? styles.negative
                : styles.positive
            }`}
          >
            {changeProps.x.interpolate(x => `${change >= 0 ? '+' : ''}${format(x)}`)}
          </animated.span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
