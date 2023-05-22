import classNames from 'classnames';
import { useSpring, animated } from 'react-spring';
import { formatNumber } from 'lib/format';
import styles from './MetricCard.module.css';

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  reverseColors = false,
  format = formatNumber,
  hideComparison = false,
  className,
}) => {
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });
  const changeProps = useSpring({ x: Number(change) || 0, from: { x: 0 } });

  return (
    <div className={classNames(styles.card, className)}>
      <animated.div className={styles.value}>{props.x.to(x => format(x))}</animated.div>
      <div className={styles.label}>
        {label}
        {~~change !== 0 && !hideComparison && (
          <animated.span
            className={classNames(styles.change, {
              [styles.positive]: change * (reverseColors ? -1 : 1) >= 0,
              [styles.negative]: change * (reverseColors ? -1 : 1) < 0,
              [styles.plusSign]: change > 0,
            })}
          >
            {changeProps.x.to(x => format(x))}
          </animated.span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
