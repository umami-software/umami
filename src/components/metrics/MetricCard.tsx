import classNames from 'classnames';
import { Icon, Icons } from 'react-basics';
import { useSpring, animated } from '@react-spring/web';
import { formatNumber } from 'lib/format';
import styles from './MetricCard.module.css';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  reverseColors?: boolean;
  format?: typeof formatNumber;
  showLabel?: boolean;
  showChange?: boolean;
  showPrevious?: boolean;
  className?: string;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  reverseColors = false,
  format = formatNumber,
  showLabel = true,
  showChange = false,
  showPrevious = false,
  className,
}: MetricCardProps) => {
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });
  const changeProps = useSpring({ x: Number(change) || 0, from: { x: 0 } });
  const prevProps = useSpring({ x: Number(value - change) || 0, from: { x: 0 } });
  const positive = change * (reverseColors ? -1 : 1) >= 0;
  const negative = change * (reverseColors ? -1 : 1) < 0;

  return (
    <div className={classNames(styles.card, className, showPrevious && styles.compare)}>
      {showLabel && <div className={styles.label}>{label}</div>}
      <animated.div className={styles.value} title={props?.x as any}>
        {props?.x?.to(x => format(x))}
      </animated.div>
      {showChange && (
        <div
          className={classNames(styles.change, {
            [styles.positive]: positive,
            [styles.negative]: negative,
            [styles.hide]: ~~change === 0,
          })}
        >
          <Icon rotate={positive || reverseColors ? -45 : 45} size={showPrevious ? 'md' : 'xs'}>
            <Icons.ArrowRight />
          </Icon>
          <animated.span title={changeProps?.x as any}>
            {changeProps?.x?.to(x => format(Math.abs(x)))}
          </animated.span>
        </div>
      )}
      {showPrevious && (
        <animated.div className={classNames(styles.value, styles.prev)} title={prevProps?.x as any}>
          {prevProps?.x?.to(x => format(x))}
        </animated.div>
      )}
    </div>
  );
};

export default MetricCard;
